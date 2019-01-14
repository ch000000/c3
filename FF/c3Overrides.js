'use strict' 

//FF added
c3.chart.internal.fn.additionalConfig = {
	legend_reverse : false, // reverse legend order
   legend_order: null, // to change legend order
	tooltip_hideblank : true,
   tooltip_reverse : true, // reverse unsorted tooltip
   tooltip_format_fulltitle: function(){}, // to show toolip full label when truncated legend labels
   reverse_x: false,
   axis_x_tick_hiddenline: false,
   data_opacities: {}, 
   data_newSelection: [],
   data_currentSelection: [],
   data_isOverlay: false // for overlay charts
};

var toggleColor = (function(){
   var currentColor = "white"; 
   return function(){
      currentColor = currentColor == "white" ? "magenta" : "white";
      $$.main.selectAll('.' + CLASS.shape + '-' + d.id).style("fill", "red");
   }
});

//FF generic c3.js local functions  added 
c3.chart.internal.fn.fnOverrides = {};

c3.chart.internal.fn.fnOverrides.asHalfPixel = function asHalfPixel(n) {
   return Math.ceil(n) + 0.5;
};
c3.chart.internal.fn.fnOverrides.ceil10 = function ceil10(v) {
   return Math.ceil(v / 10) * 10;
};
c3.chart.internal.fn.fnOverrides.diffDomain = function diffDomain(d) {
   return d[1] - d[0];
};
c3.chart.internal.fn.fnOverrides.getOption = function getOption(options, key, defaultValue) {
   return c3.chart.internal.fn.fnOverrides.isDefined(options[key]) ? options[key] : defaultValue;
};
c3.chart.internal.fn.fnOverrides.getPathBox = function getPathBox(path) {
   var box = path.getBoundingClientRect(),
     items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
     minX = items[0].x,
     minY = Math.min(items[0].y, items[1].y);
   return {
      x: minX,
      y: minY,
      width: box.width,
      height: box.height
    };
};
c3.chart.internal.fn.fnOverrides.hasValue = function hasValue(dict, value) {
   var found = false;
   Object.keys(dict).forEach(function (key) {
   if (dict[key] === value) {
     found = true;
   }
   });
   return found;
};
c3.chart.internal.fn.fnOverrides.isArray = function isArray(o) {
   return Array.isArray(o);
};
c3.chart.internal.fn.fnOverrides.isDefined = function isDefined(v) {
   return typeof v !== 'undefined';
};
c3.chart.internal.fn.fnOverrides.isEmpty = function isEmpty(o) {
   return typeof o === 'undefined' || o === null || isString(o) && o.length === 0 || _typeof(o) === 'object' && Object.keys(o).length === 0;
};
c3.chart.internal.fn.fnOverrides.isFunction = function isFunction(o) {
   return typeof o === 'function';
};
c3.chart.internal.fn.fnOverrides.isString = function isString(o) {
   return typeof o === 'string';
};
c3.chart.internal.fn.fnOverrides.isUndefined = function isUndefined(v) {
   return typeof v === 'undefined';
};
c3.chart.internal.fn.fnOverrides.isValue = function isValue(v) {
   return v || v === 0;
};
c3.chart.internal.fn.fnOverrides.notEmpty = function notEmpty(o) {
   return !c3.chart.internal.fn.fnOverrides.isEmpty(o);
};
c3.chart.internal.fn.fnOverrides.sanitise = function sanitise(str) {
   return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
};  
// \ FF generic c3.js local functions  added 

// 09-01-19 - CHANGES TO C3 V0.6.12 untested because overlay charts are not working.
c3.chart.internal.fn.getShapeX = function (offset, targetsNum, indices, isSub, isOverlay) {

    var $$ = this, scale = isSub ? $$.subX : $$.x;
    return function (d) {
        var index = d.id in indices ? indices[d.id] : 0;
        //FF UPDATE - Overlay
        if (isOverlay) {
          return d.x || d.x === 0 ? scale(d.x) - offset / 2  : 0;
        }
        else {
          return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
        }
    };
};  

// 09-01-19 - CHANGES TO C3 V0.6.12 untested because overlay charts are not working.
c3.chart.internal.fn.fnOverrides.generateGetBarPoints = function (barIndices, isSub) {
   var $$ = this,
     axis = isSub ? $$.subXAxis : $$.xAxis,
     barTargetsNum = barIndices.__max__ + 1,
     barW = $$.getBarW(axis, barTargetsNum),
     barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
     barY = $$.getShapeY(!!isSub),
     barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
     barSpaceOffset = barW * ($$.config.bar_space / 2),
     yScale = isSub ? $$.getSubYScale : $$.getYScale;
   return function (d, i) {
   var y0 = yScale.call($$, d.id)(0),
       offset = barOffset(d, i) || y0,
       // offset is for stacked bar chart
       posX = barX(d),
       posY = barY(d); // fix posY not to overflow opposite quadrant

       isOverlay = $$.config.data_isOverlay;  //FF UPDATE - OVERLAY
       
   if ($$.config.axis_rotated) {
     if (0 < d.value && posY < y0 || d.value < 0 && y0 < posY) {
       posY = y0;
     }
   } // 4 points that make a bar

   if ( !isOverlay || d.id =="data1") {
     //FF UPDATE - Overlay 
      return [
         [posX + barSpaceOffset, offset], 
         [posX + barSpaceOffset, posY - (y0 - offset)], 
         [posX + barW - barSpaceOffset, posY - (y0 - offset)], 
         [posX + barW - barSpaceOffset, offset]
      ];
   }
    //FF UPDATE - Overlay
   if ( isOverlay && d.id == "data2") {  
       var gap = barW * 0.25;
       return [
         [posX + gap + barSpaceOffset, offset], 
         [posX + gap + barSpaceOffset, posY - (y0 - offset)], 
         [posX - gap + barW - barSpaceOffset, posY - (y0 - offset)], 
         [posX - gap + barW - barSpaceOffset, offset]
       ];  
     }   
   };
};


//FF UPDATE - need $$(this) passed in because 'this' not defined in tooltip
//used by getTooltipContent - adapted to work in c3Overrides - no other modification
//old: c3.chart.internal.fn.getTooltipSortFunction = function () {
c3.chart.internal.fn.getTooltipSortFunction = function ($$) {
   //old: var $$ = this,
   // \ FF UPDATE - need $$(this) passed in because 'this' not defined in tooltip
   var 
      config = $$.config,
      isString =  c3.chart.internal.fn.fnOverrides.isString,
      isFunction =  c3.chart.internal.fn.fnOverrides.isFunction,
      isArray =  c3.chart.internal.fn.fnOverrides.isArray;  ;        

   if (config.data_groups.length === 0 || config.tooltip_order !== undefined) {
      // if data are not grouped or if an order is specified
      // for the tooltip values we sort them by their values
      var order = config.tooltip_order;

      if (order === undefined) {
        order = config.data_order;
      }

      var valueOf = function valueOf(obj) {
        return obj ? obj.value : null;
      }; // if data are not grouped, we sort them by their value


      if (isString(order) && order.toLowerCase() === 'asc') {
        return function (a, b) {
          return valueOf(a) - valueOf(b);
        };
      } else if (isString(order) && order.toLowerCase() === 'desc') {
        return function (a, b) {
          return valueOf(b) - valueOf(a);
        };
      } else if (isFunction(order)) {
        // if the function is from data_order we need
        // to wrap the returned function in order to format
        // the sorted value to the expected format
        var sortFunction = order;

        if (config.tooltip_order === undefined) {
          sortFunction = function sortFunction(a, b) {
            return order(a ? {
              id: a.id,
              values: [a]
            } : null, b ? {
              id: b.id,
              values: [b]
            } : null);
          };
        }

        return sortFunction;
      } else if (isArray(order)) {
        return function (a, b) {
          return order.indexOf(a.id) - order.indexOf(b.id);
        };
      }
   } else { 
      // if data are grouped, we follow the order of grouped targets
      var ids = $$.orderTargets($$.data.targets).map(function (i) {
        return i.id;
      }); // if it was either asc or desc we need to invert the order
      // returned by orderTargets  
      
      // FF UPDATE - To restore same default sort order as in v0.4.11
      // if ($$.isOrderAsc() || $$.isOrderDesc()) {
      var reverse = config.tooltip_reverse;
      if ($$.isOrderAsc() || $$.isOrderDesc() || reverse === true) {
      // \ FF UPDATE 
        ids = ids.reverse();
      }   
      return function (a, b) {
         return ids.indexOf(a.id) - ids.indexOf(b.id);
      };
   }
}; 
 

c3.chart.internal.fn.getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {
   var 
      $$ = this,
      config = $$.config,
      titleFormat = config.tooltip_format_title || defaultTitleFormat,
      nameFormat = config.tooltip_format_name || function (name) {
         return name;
      },
      valueFormat = config.tooltip_format_value || defaultValueFormat,
      text,
      i,
      title,
      value,
      name,
      bgcolor;

      //FF UPDATE - reference to functions from c3.js changed 
   var 
      base = this.__proto__,  
      sanitise =  $$.fnOverrides.sanitise,
      getTooltipSortFunction = base.getTooltipSortFunction;
      // \ FF UPDATE 
      
      var tooltipSortFunction = getTooltipSortFunction($$);

      if (tooltipSortFunction) {
      d.sort(tooltipSortFunction);
      } 
  
    for (i = 0; i < d.length; i++) {
      if (!(d[i] && (d[i].value || d[i].value === 0))) {
        continue;
      }

      if (!text) {
        //FF UPDATE - for truncated long labels 
        // old: title = sanitise(titleFormat ? titleFormat(d[i].x, d[i].index) : d[i].x);
        title = config.tooltip_format_fulltitle ? sanitise(config.tooltip_format_fulltitle(d[i].x)) : sanitise(titleFormat ? titleFormat(d[i].x, d[i].index) : d[i].x); 
        // \ FF UPDATE  
        
        text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
      }

      value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));

      if (value !== undefined) {
        // Skip elements when their name is set to null
        if (d[i].name === null) {
          continue;
        }

        name = sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
        // FF UPDATE - for lowlevel color  
        // old:  bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);
        bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i]);
        // \FF UPDATE
        text += "<tr class='" + $$.CLASS.tooltipName + "-" + $$.getTargetSelectorSuffix(d[i].id) + "'>";
        text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
        text += "<td class='value'>" + value + "</td>";
        text += "</tr>";
      }
    }

    return text + "</table>";
  }; 
 
  
c3.chart.internal.fn.updateLegend = function (targetIds, options, transitions) {  
   var $$ = this,
     config = $$.config,
     base = this.__proto__, 
     CLASS = base.CLASS,
     //FF UPDATE - reference to functions from c3.js changed 
     fnOverrides = $$.fnOverrides,
     isDefined = fnOverrides.isDefined,
     getOption = fnOverrides.getOption;
     // \ FF UPDATE
   var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect, x1ForLegendTile, x2ForLegendTile, yForLegendTile;
   var paddingTop = 4,
     paddingRight = 10,
     maxWidth = 0,
     maxHeight = 0,
     posMin = 10,
     tileWidth = config.legend_item_tile_width + 5;
   var l,
     totalLength = 0,
     offsets = {},
     widths = {},
     heights = {},
     margins = [0],
     steps = {},
     step = 0;
   var withTransition, withTransitionForTransform;
   var texts, rects, tiles, background; // Skip elements when their name is set to null

   //FF - added - clone targetIds
   var legendTargetIds = targetIds.slice(0);

   //FF - replaced targetIds with legendTargetIds
   // old: targetIds = targetIds.filter(function (id) {targetIds = targetIds.filter(function (id) {
   legendTargetIds = legendTargetIds.filter(function (id) {
         return !isDefined(config.data_names[id]) || config.data_names[id] !== null;
      });

   //FF - added - option to reverse order
   if (config.legend_reverse){
   legendTargetIds.reverse(); 
   };

   //FF - added - option to change order
   if (config.legend_order){
   legendTargetIds = config.legend_order;
   };
     
   options = options || {};
   withTransition = getOption(options, "withTransition", true);
   withTransitionForTransform = getOption(options, "withTransitionForTransform", true);

   function getTextBox(textElement, id) {
   if (!$$.legendItemTextBox[id]) {
     $$.legendItemTextBox[id] = $$.getTextRect(textElement.textContent, CLASS.legendItem, textElement);
   }

   return $$.legendItemTextBox[id];
   }

   function updatePositions(textElement, id, index) {
   var reset = index === 0,
       isLast = index === legendTargetIds.length - 1,
       box = getTextBox(textElement, id),
       itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
       itemHeight = box.height + paddingTop,
       itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
       areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
       margin,
       maxLength; // MEMO: care about condifion of step, totalLength

   function updateValues(id, withoutStep) {
     if (!withoutStep) {
       margin = (areaLength - totalLength - itemLength) / 2;

       if (margin < posMin) {
         margin = (areaLength - itemLength) / 2;
         totalLength = 0;
         step++;
       }
     }

     steps[id] = step;
     margins[step] = $$.isLegendInset ? 10 : margin;
     offsets[id] = totalLength;
     totalLength += itemLength;
   }

   if (reset) {
     totalLength = 0;
     step = 0;
     maxWidth = 0;
     maxHeight = 0;
   }

   if (config.legend_show && !$$.isLegendToShow(id)) {
     widths[id] = heights[id] = steps[id] = offsets[id] = 0;
     return;
   }

   widths[id] = itemWidth;
   heights[id] = itemHeight;

   if (!maxWidth || itemWidth >= maxWidth) {
     maxWidth = itemWidth;
   }

   if (!maxHeight || itemHeight >= maxHeight) {
     maxHeight = itemHeight;
   }

   maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

   if (config.legend_equally) {
     Object.keys(widths).forEach(function (id) {
       widths[id] = maxWidth;
     });
     Object.keys(heights).forEach(function (id) {
       heights[id] = maxHeight;
     });
     margin = (areaLength - maxLength * legendTargetIds.length) / 2;

     if (margin < posMin) {
       totalLength = 0;
       step = 0;
       legendTargetIds.forEach(function (id) {
         updateValues(id);
       });
     } else {
       updateValues(id, true);
     }
   } else {
     updateValues(id);
   }
   }

   if ($$.isLegendInset) {
   step = config.legend_inset_step ? config.legend_inset_step : legendTargetIds.length;
   $$.updateLegendStep(step);
   }

   if ($$.isLegendRight) {
   xForLegend = function xForLegend(id) {
     return maxWidth * steps[id];
   };

   yForLegend = function yForLegend(id) {
     return margins[steps[id]] + offsets[id];
   };
   } else if ($$.isLegendInset) {
   xForLegend = function xForLegend(id) {
     return maxWidth * steps[id] + 10;
   };

   yForLegend = function yForLegend(id) {
     return margins[steps[id]] + offsets[id];
   };
   } else {
   xForLegend = function xForLegend(id) {
     return margins[steps[id]] + offsets[id];
   };

   yForLegend = function yForLegend(id) {
     return maxHeight * steps[id];
   };
   }

   xForLegendText = function xForLegendText(id, i) {
   return xForLegend(id, i) + 4 + config.legend_item_tile_width;
   };

   yForLegendText = function yForLegendText(id, i) {
   return yForLegend(id, i) + 9;
   };

   xForLegendRect = function xForLegendRect(id, i) {
   return xForLegend(id, i);
   };

   yForLegendRect = function yForLegendRect(id, i) {
   return yForLegend(id, i) - 5;
   };

   x1ForLegendTile = function x1ForLegendTile(id, i) {
   return xForLegend(id, i) - 2;
   };

   x2ForLegendTile = function x2ForLegendTile(id, i) {
   return xForLegend(id, i) - 2 + config.legend_item_tile_width;
   };

   yForLegendTile = function yForLegendTile(id, i) {
   return yForLegend(id, i) + 4;
   }; // Define g for legend area


   l = $$.legend.selectAll('.' + CLASS.legendItem).data(legendTargetIds).enter().append('g').attr('class', function (id) {
   return $$.generateClass(CLASS.legendItem, id);
   }).style('visibility', function (id) {
   return $$.isLegendToShow(id) ? 'visible' : 'hidden';
   }).style('cursor', 'pointer').on('click', function (id) {
   if (config.legend_item_onclick) {
     config.legend_item_onclick.call($$, id);
   } else {
     if ($$.d3.event.altKey) {
       $$.api.hide();
       $$.api.show(id);
     } else {
       $$.api.toggle(id);
       $$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert();
     }
   }
   }).on('mouseover', function (id) {
   if (config.legend_item_onmouseover) {
     config.legend_item_onmouseover.call($$, id);
   } else {
     $$.d3.select(this).classed(CLASS.legendItemFocused, true);

     if (!$$.transiting && $$.isTargetToShow(id)) {
       $$.api.focus(id);
     }
   }
   }).on('mouseout', function (id) {
   if (config.legend_item_onmouseout) {
     config.legend_item_onmouseout.call($$, id);
   } else {
     $$.d3.select(this).classed(CLASS.legendItemFocused, false);
     $$.api.revert();
   }
   });
   l.append('text').text(function (id) {
   return isDefined(config.data_names[id]) ? config.data_names[id] : id;
   }).each(function (id, i) {
   updatePositions(this, id, i);
   }).style("pointer-events", "none").attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
   l.append('rect').attr("class", CLASS.legendItemEvent).style('fill-opacity', 0).attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);
   l.append('line').attr('class', CLASS.legendItemTile).style('stroke', $$.color).style("pointer-events", "none").attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200).attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile).attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200).attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile).attr('stroke-width', config.legend_item_tile_height); // Set background for inset legend

   background = $$.legend.select('.' + CLASS.legendBackground + ' rect');

   if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
   background = $$.legend.insert('g', '.' + CLASS.legendItem).attr("class", CLASS.legendBackground).append('rect');
   }

   texts = $$.legend.selectAll('text').data(legendTargetIds).text(function (id) {
   return isDefined(config.data_names[id]) ? config.data_names[id] : id;
   }) // MEMO: needed for update
   .each(function (id, i) {
   updatePositions(this, id, i);
   });
   (withTransition ? texts.transition() : texts).attr('x', xForLegendText).attr('y', yForLegendText);
   rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent).data(legendTargetIds);
   (withTransition ? rects.transition() : rects).attr('width', function (id) {
   return widths[id];
   }).attr('height', function (id) {
   return heights[id];
   }).attr('x', xForLegendRect).attr('y', yForLegendRect);
   tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile).data(legendTargetIds);
   (withTransition ? tiles.transition() : tiles).style('stroke', $$.levelColor ? function (id) {
   return $$.levelColor($$.cache[id].values[0].value);
   } : $$.color).attr('x1', x1ForLegendTile).attr('y1', yForLegendTile).attr('x2', x2ForLegendTile).attr('y2', yForLegendTile);

   if (background) {
   (withTransition ? background.transition() : background).attr('height', $$.getLegendHeight() - 12).attr('width', maxWidth * (step + 1) + 10);
   } // toggle legend state


   $$.legend.selectAll('.' + CLASS.legendItem).classed(CLASS.legendItemHidden, function (id) {
   return !$$.isTargetToShow(id);
   }); // Update all to reflect change of legend

   $$.updateLegendItemWidth(maxWidth);
   $$.updateLegendItemHeight(maxHeight);
   $$.updateLegendStep(step); // Update size and scale

   $$.updateSizes();
   $$.updateScales();
   $$.updateSvgSize(); // Update g positions

   $$.transformAll(withTransitionForTransform, transitions);
   $$.legendHasRendered = true;
};
  


