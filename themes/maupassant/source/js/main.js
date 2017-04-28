// local search
var searchFunc = function(path, search_id, content_id) {
    'use strict';
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            // get the contents from search data
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get();
            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);
            $input.addEventListener('input', function(){
                var str='<ul class=\"search-result-list\">';
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                if (this.value.trim().length <= 0) {
                    return;
                }
                // perform local searching
                datas.forEach(function(data) {
                    var isMatch = true;
                    var content_index = [];
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    // only match artiles with not empty titles and contents
                    if(data_title != '' && data_content != '') {
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            if( index_title < 0 && index_content < 0 ){
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                            }
                        });
                    }
                    // show search results
                    if (isMatch) {
                        str += "<li><a href='"+ data_url +"' class='search-result-title'>"+ data_title +"</a>";
                        var content = data.content.trim().replace(/<[^>]+>/g,"");
                        if (first_occur >= 0) {
                            // cut out 100 characters
                            var start = first_occur - 30;
                            var outLength = 78;
                            if(start < 0){
                                start = 0;
                            }
                            if (start + outLength > content.length){
                                if(content.length < outLength){
                                    outLength = content.length - start;
                                }else{
                                    start = content.length - outLength;
                                }
                            }
                            var match_content = content.substr(start, outLength);
                            // highlight all keywords
                            keywords.forEach(function(keyword){
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">"+keyword+"</em>");
                            });

                            str += "<p class=\"search-result\">" + match_content +"...</p>"
                        }
                        str += "</li>";
                    }
                });
                str += "</ul>";
                $resultContent.innerHTML = str;
            });
        }
    });
}
searchFunc('/search.xml', 'local-search-input', 'local-search-result');

// code block
+function($) {
    'use strict';

    // Resize code blocks to fit the screen width

    var CodeBlockResizer = function(elem) {
        this.$codeBlocks = $(elem);
    };

    CodeBlockResizer.prototype = {
        /**
         * Run main feature
         */
        run: function() {
            var self = this;
            // resize all codeblocks
            self.resize();
            // resize codeblocks when window is resized
            $(window).smartresize(function() {
                self.resize();
            });
        },

        /**
         * Resize codeblocks
         */
        resize: function() {
            var self = this;
            self.$codeBlocks.each(function() {
                var $gutter = $(this).find('.gutter');
                var $code = $(this).find('.code');
                // get padding of code div
                var codePaddings = $code.width() - $code.innerWidth();
                // code block div width with padding - gutter div with padding + code div padding
                var width = $(this).outerWidth() - $gutter.outerWidth() + codePaddings;
                // apply new width
                $code.css('width', width);
                $code.children('pre').css('width', width);
            });
        }
    };

    $(document).ready(function() {
        // register jQuery function to check if an element has an horizontal scroll bar
        $.fn.hasHorizontalScrollBar = function() {
            return this.get(0).scrollWidth > this.innerWidth();
        };
        var resizer = new CodeBlockResizer('figure.highlight');
        resizer.run();
    });
}(jQuery);

// smart resize
+(function($, sr) {
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function(func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;

            function delayed() {
                if (!execAsap) {
                    func.apply(obj, args);
                }

                timeout = null;
            };

            if (timeout) {
                clearTimeout(timeout);
            }
            else if (execAsap) {
                func.apply(obj, args);
            }

            timeout = setTimeout(delayed, threshold || 100);
        };
    };

    jQuery.fn[sr] = function(fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };
})(jQuery, 'smartresize');
