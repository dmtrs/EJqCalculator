/*
 * JQ-Calculator formula track
 * 
 * 2011 Andreas Geissel
 */

(function($)
{
   var opKey = 'calculationOperands';
   var targetKey = 'calculationResult';
   var highlightClass = 'formulaTrackerHighlight';
   var blinkTimes = 2;
   
   // --------------------------------------------------
   function createDiv(jqelm)
   {
      var div = $('<div>');
      div.html(jqelm.selector || jqelm.attr('name') || jqelm.context.nodeName);

      var fcn = function()
      {
         if (!fcn.counter)
         {
            fcn.counter = blinkTimes * 2;
         }

         if (fcn.counter-- % 2)
         {
           jqelm.removeClass(highlightClass);
         }
         else
         {
           jqelm.addClass(highlightClass);
         }

         if (fcn.counter > 0)
         {
           window.setTimeout(fcn, 400);
         }
      };
      
      div.bind('mouseover', fcn);
      div.bind('dblclick', function() { jqelm.trigger('dblclick'); });
      
      return div;
   }

   // --------------------------------------------------
   function fillTd(jqTr, jqelm, dataKey)
   {
      if (jqelm.data(dataKey) && (jqelm.data(dataKey).size() > 0))
      {
         var td = $('<td>').appendTo(jqTr);
         td.addClass(dataKey + "Class");
         jqelm.data(dataKey).each(function (index, jqop) {
            td.append(createDiv(jqop));
         });
      }
   }

   // --------------------------------------------------
   function createPopup(jqelm)
   {
      var popup = $('<div>');
      var tab = $('<table>').appendTo(popup).width('100%');
      var tr = $('<tr>').appendTo(tab);
      tr.css('vertical-align', 'middle');

      fillTd(tr, jqelm, opKey);

      $('<td>').appendTo(tr)
               .append(createDiv(jqelm))
               .addClass('calculationCurrentOperandClass');

      fillTd(tr, jqelm, targetKey);
      
      popup.hide();
      jqelm.after(popup);
      return popup;
   }
   
   // --------------------------------------------------
   function showPopup(event)
   {
      var jqThis = $(this);
      var popup = jqThis.data('_formulaTrackPopup');
      if (!popup)
      {
         popup = createPopup(jqThis);
         jqThis.data('_formulaTrackPopup', popup);
      }
      
      popup.toggle();
   }
   
   // --------------------------------------------------
   function setTrigger(jqelm)
   {
      if (!jqelm.data('_hasFormulaTrack'))
      {
        jqelm.bind('dblclick', showPopup);
        jqelm.data('_hasFormulaTrack', true);
      }
   }
   
   // --------------------------------------------------
   function track(jqTarget, jqOperand, msg)
   {
      var operands = jqTarget.data(opKey);
      if (!operands)
      {
         operands = new $();
         jqTarget.data(opKey, operands);
         setTrigger(jqTarget);
      }

      if (jqOperand)
      {
         jqOperand.each(function (index, elm)
         {
            var jqelm = $(elm);
            operands.push(jqelm); 

            var jqTargets = jqelm.data(targetKey);
            if (!jqTargets)
            {
               jqTargets = new $();
               jqelm.data(targetKey, jqTargets);
            }
   
            jqTargets.push(jqTarget);
            setTrigger(jqelm);
         });
      }
   }

   $.trackFormula = track;
   
})(jQuery);