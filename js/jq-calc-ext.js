/*
 * JQ-Calculator Extension
 *
 * 2011 Andreas Geissel
 */
(function($)
{
   function standardFactory(workerFcn)
   {
      return function(a, b) { return !a ? b : workerFcn(a, b); };
   }

   // --------------------------------------------------
   function getWellKnowAggregatorFcn(functionName)
   {
      switch(functionName)
      {
         case 'sum': return standardFactory(function(a, b) { return a + b; });
         case 'min': return standardFactory(Math.min);
         case 'max': return standardFactory(Math.max);
         case 'avg': return (function()
                     {
                         var ii = 0, sum = 0;
                         return function(total, next)
                         {
                            if (!total) { ii = sum = 0; }
                            return (sum += next) / ++ii;
                         };
                     })();
         case 'count': return function(total, next)
                       {
                             if (!total) { total = 0; }
                             if (next != null) { ++total; }
                             return total; 
                       };
         default: throw 'unknown function name "' + functionName + '"';
      }
   }

   // --------------------------------------------------
   function installMethodFor(fcnName)
   {
      var worker = getWellKnowAggregatorFcn(fcnName);
      
      $.fn[fcnName] = function(jqAggregationFieldsOrSelector)
      {
         return this.aggregate(jqAggregationFieldsOrSelector, worker); 
      };
      
      return worker;
   }

   // --------------------------------------------------
   $.withAggregatorFunctions = function(wellKnownFunctionNamesArr)
   {
      var fcnSet = { };
      if (wellKnownFunctionNamesArr)
      {
         for (var ii = 0; ii < wellKnownFunctionNamesArr.length; ++ii)
         {
            var fcnName = wellKnownFunctionNamesArr[ii];
            fcnSet[fcnName] = installMethodFor(fcnName);
         }
      }
      return fcnSet;
   };

   // --------------------------------------------------
   $.setFormulae = function(formulaSet, replacement, replaceValues)
   {
      if (replacement && replaceValues)
      {
         var regexp = new RegExp(replacement, 'g');
         var newFormulaSet = { };
         for (var targetSelectorTemplate in formulaSet)
         {
            var formulaTemplate = formulaSet[targetSelectorTemplate];

            if (replacement && replaceValues)
            {
               for (var ii = 0; ii < replaceValues.length; ++ii)
               {
                  var val = replaceValues[ii];
                  var targetSelector = targetSelectorTemplate.replace(regexp, val);
                  var formula        = formulaTemplate.replace(regexp, val);
                  newFormulaSet[targetSelector] = formula;
               }
            }
         }
         formulaSet = newFormulaSet;
      }

      for (var targetSelector in formulaSet)
      {
         var jqTarget      = $(targetSelector);
         var formulaString = formulaSet[targetSelector];
         jqTarget.addFormula(formulaString);         
      }
   };

})(jQuery);
