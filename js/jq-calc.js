/*
 * JQ-Calculator
 *
 * 2011 Andreas Geissel
 */

(function($)
{
   var calcFcnKey = 'recalculationfunctions';
   var calcEvtName = 'recalculate';

   var operandRegExp  = '(.+?)(?:\\s*\\|\\|\\s*(.+?))?';
   var iteratorRegExp = new RegExp('\\{\\{' + operandRegExp + '\\}\\}(.*)$');
   var parserRegExp   = new RegExp('^' + operandRegExp + '$');

   var native2customEvent = 'change';

   // --------------------------------------------------
   var track = function()
   {
      track = $.trackFormula || $.noop;
      track.apply(null, arguments);
   };
   
   // --------------------------------------------------
   /* get by id, by name or by selector */
   function $$$(idOrNameOrSelector)
   {
      var jqelm; 
      try
      {
         jqelm = $('#' + idOrNameOrSelector);

         if (jqelm.size() == 0)
         {
            jqelm = $('//[name = "' + idOrNameOrSelector + '"]');
         }
      }
      catch(ignored)
      { }

      if (!jqelm || (jqelm.size() == 0))
      {
         jqelm = $(idOrNameOrSelector);
      }

      return jqelm;
   }

   // --------------------------------------------------
   function toDisplay(numberOrString, precision)
   {
      try
      {
         var num = parseFloat(numberOrString);
         if (!isNaN(num) && (num != Number.NaN))
         {
            if (precision)
            {
               num = num.toFixed(precision);
            }
            return num;
         }
      }
      catch(ignored)
      { }

      return '';
   }

   // --------------------------------------------------
   function getRawValue(jqelm)
   {
      if (jqelm.get(0).tagName.match(/input|select|textarea/i))
      {
         return jqelm.val();
      }

      return jqelm.html();
   }

   // --------------------------------------------------
   function getFieldValue(elmAccessor)
   {
      if (elmAccessor.match(parserRegExp))
      {
         var idOrName   = RegExp.$1;
         var defaultVal = RegExp.$2;
         var jqelm      = $$$(idOrName);
         var val        = getRawValue(jqelm);

         if (!val || (val == ''))
         {
            val = defaultVal;
         }

         try
         {
            return parseFloat(val);
         }
         catch(ignored)
         { }
         
         if (jqelm.calculation.mapping && jqelm.calculation.mapping[idOrName])
         {
            val = jqelm.calculation.mapping[idOrName][val];
            if (val)
            {
               return val;
            }
         }
      }

      return Number.NaN;
   }

   // --------------------------------------------------
   function createValueSetter(jqelm)
   {
      var recalc = function() { jqelm.trigger(calcEvtName); };
      if (jqelm.get(0).innerHTML)
      {
         return function(val) { jqelm.html(val); recalc(); };
      }
      return function(val) { jqelm.val(val); recalc(); };
   }

   // --------------------------------------------------
   function createCalculationFcn(jqelm, formulaString)
   {
      var setter  = createValueSetter(jqelm);
      var formula = formulaString.replace(/\{\{(.+?)\}\}/g, 'getFieldValue("$1")');
      eval('formula = function() { return ' + formula + '; };');

      return function()
      {
         var precision = jqelm.calculation.precision;
         var val = formula();
         val = toDisplay(val, precision);
         setter(val);
      };
   }

   // --------------------------------------------------
   function createAggregationFcn(jqTarget, jqOperandSet, aggregatorFcn)
   {
      if (!aggregatorFcn)
      {
         throw 'no aggregator function';
      }

      var setter = createValueSetter(jqTarget);
      return function()
      {
         var val = null;
         var fcn = function()
         {
            var b = getRawValue($(this));
            if ((b != null) && (b != ''))
            {
               try
               {
                 val = aggregatorFcn(val, parseFloat(b), jqOperandSet.size());
               }
               catch(ignored)
               { } 
            }
         };
         jqOperandSet.each(fcn);
         setter(toDisplay(val, jqTarget.calculation.precision));
      };
   }

   // --------------------------------------------------
   function recalculate(evt)
   {
      var jqthis   = $(this);
      var calcFcns = jqthis.calculation();
      if (calcFcns && calcFcns.length && (calcFcns.length > 0))
      {
         for (var ii = 0; ii < calcFcns.length; ++ii)
         {
            calcFcns[ii].apply(jqthis);
         }
      }
   }

   // --------------------------------------------------
   $.fn.calculation = function(newCalcFcn)
   {
      var jqelm = this;
      var allCalcFcns = jqelm.data(calcFcnKey);
      if (newCalcFcn)
      {
         if (jqelm.size() == 1)
         {
            if (!allCalcFcns)
            {
               allCalcFcns = [];
               jqelm.data(calcFcnKey, allCalcFcns);
               jqelm.bind(calcEvtName, recalculate);
               jqelm.bind(native2customEvent, function() { jqelm.trigger(calcEvtName); });
            }
            allCalcFcns.push(newCalcFcn);
         }
      }
      else
      {
         return allCalcFcns;
      }
   };
   
   $.fn.calculation.precision = 4;

   // --------------------------------------------------
   $.fn.removeCalculation = function()
   {
      this.each(function(index, domelm) {
         $(domelm).removeData(calcFcnKey);
      });
   };

   // --------------------------------------------------
   $.fn.addFormula = function(formulaString)
   {
      var target = this;
      this.each(function() {
         var jqThis = $(this);
         var calcFcn = createCalculationFcn(jqThis, formulaString);
         track(jqThis, null, formulaString);
   
         var formulaTail = formulaString;
         while (formulaTail.match(iteratorRegExp))
         {
            formulaTail  = RegExp.$3;
            var idOrName = RegExp.$1;
            var dflt     = RegExp.$2;
            var jqelm    = $$$(idOrName);
            jqelm.calculation(calcFcn);
            track(jqThis, jqelm, target.selector, ' = ', formulaString);
         }
      });
      
      return this;
   };

   // --------------------------------------------------
   $.fn.aggregate = function(jqAggregationFieldsOrSelector, aggregatorFcn)
   {
      var jqAggFields = $(jqAggregationFieldsOrSelector);
      var calcFcn = createAggregationFcn(this, jqAggFields, aggregatorFcn);
      track(this, jqAggFields, this.selector, '-> aggregation(', this.jqAggregationFieldsOrSelector, ')');
      jqAggFields.each(function() { $(this).calculation(calcFcn); });
      
      return this;
   };
   
   // --------------------------------------------------
   $.fn.aggregateTo = function(jqTargetOrSelector, aggregatorFcn)
   {
      $(jqTargetOrSelector).aggregate(this, aggregatorFcn);
      return this;
   };

})(jQuery);
