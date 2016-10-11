// 洗牌算法，对数组进行乱序处理
function shuffle(array){
    var _array = array.concat();

    for (var i = _array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random()*(i+1));
        var temp = _array[i];
        _array[i] = _array[j];
        _array[j] = temp;
    }

    return _array;
}
//动态更新背景文字
function updateHeatmap(word_data){
    var points = [];
    for (var i = 0; i < word_data.length; i++) {
        var x = Math.floor(Math.random()*browser.windowWidth);
        var y = Math.floor(Math.random()*browser.windowHeight);
        $(".wordList").append("<li id='"+i+"' style='left:"+x+"px;top:"+y+"px;' data-value='"+word_data[i].value+"'>"+word_data[i].name+"</li>");
        points.push({
            x: x,
            y: y,
            value: word_data[i].value
        });
    }
    
    // create configuration object
    var config = {
        container: document.getElementById('heatmap'),
        // radius: 100,
        maxOpacity: 0.5,
        minOpacity: 0.015,
        blur: 1,
        // gradient: {
        //   // enter n keys between 0 and 1 here
        //   // for gradient color customization
        //   '.2': 'gray',
        //   '.5': 'pink',
        //   '.8': 'orange',
        //   '.95': 'red'
        // }
    };
    // create heatmap with configuration
    var heatmap = h337.create(config); 
    var point_data = {
        // max: 10000,
        min: 1000000,
        data: points
    };
    heatmap.setData(point_data);
}


$(function () {
    var colors = ['#4D79CF', '#24B3C4', '#91E0F9', '#AD7ACE', '#57B04F', '#8EE286', '#FBAC58', '#F6E351', '#C3965B', '#F35650'];
    Highcharts.setOptions({
        colors: shuffle(colors),
        chart: {
            borderWidth: 0,
            plotShadow: true
        }
    });

    //获取实时数据
    $.getJSON('/getRealHotData', function(result){
        var data = result.data;
        var categories = [];
        for (var i = 0; i < data.length; i++) {
            categories.push(data[i].name);
        }
        var RealHotChart = new Highcharts.Chart({
            chart: {
                renderTo: 'RealHotChart',
                type: 'column',
                style: {
                    fontFamily: '"microsoft yahei"',
                    fontSize: '12px',
                    color: '#263E56'
                },
                borderWidth: 0,
                backgroundColor: 'transparent',
                plotBorderWidth: 0,
                events: {
                    load: function(){
                        var series = this.series[0];
                        setInterval(function(){
                            $.getJSON('/getRealHotData', function(result){
                                var data = result.data;
                                categories = [];
                                for (var i = 0; i < data.length; i++) {
                                    categories.push(data[i].name);
                                }
                                RealHotChart.xAxis[0].setCategories(categories, true);
                                series.setData(data, true);
                            });
                        }, 1500);
                    }
                }
            },
            credits: false,
            title: {
                text: ''
            },
            xAxis: {
                title: {
                    text: ''
                },
                categories: categories,
                lineWidth: 1,
                minorGridLineWidth: 0,
                minorTickLength: 0,
                tickLength: 0
            },
            yAxis: {
                min: 100000,
                title: {
                    text: '实时热搜指数'
                },
                gridLineWidth: 0,
                tickLength: 5,
                tickWidth: 1,
                tickPosition: 'outside',
                labels: {
                    align: 'right',
                    x:-10,
                    y:5
                },
                lineWidth:1,
            },
            legend: {
                enabled: false
            },
            tooltip: {
                // pointFormat:'<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
            },
            plotOptions: {
                column: {
                    borderRadius: 2,
                    cursor: 'pointer',
                    events: {
                        click: function(e){
                            window.open(e.point.url);
                        }
                    }
                },
                series: {
                    colorByPoint: true
                }
            },
            series: [{
                name: '搜索指数',
                data: data,
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y}',
                    y: 10, // 10 pixels down from the top
                    style: {
                        fontSize: '12px',
                        fontFamily: '"microsoft yahei"'
                    }
                }
            }]
        });
    });  
    //综合数据，热力图
    $.getJSON('/getTotalHotData', function(result){
        var word_data = result.data;
        var points = [];
        var height = browser.windowHeight - 50;
        for (var i = 0; i < word_data.length; i++) {
            var x = Math.floor(Math.random()*browser.windowWidth);
            var y = Math.floor(Math.random()*height+50);
            $(".wordList").append("<li id='"+i+"' style='left:"+x+"px;top:"+y+"px;' data-value='"+word_data[i].y+"'>"+word_data[i].name+"</li>");
            points.push({
                x: x,
                y: y,
                value: word_data[i].y
            });
        }
        
        // create configuration object
        var config = {
            container: document.getElementById('heatmap'),
            radius: 100,
            maxOpacity: 0.5,
            minOpacity: 0.015,
            blur: 1,
            // gradient: {
            //   // enter n keys between 0 and 1 here
            //   // for gradient color customization
            //   '.2': 'gray',
            //   '.5': 'pink',
            //   '.8': 'orange',
            //   '.95': 'red'
            // }
        };
        // create heatmap with configuration
        var heatmap = h337.create(config); 
        var point_data = {
            // max: 10000,
            min: 1000000,
            data: points
        };
        heatmap.setData(point_data);
    });
    //综合数据，文字标签
    $.getJSON('/getTotalHotData', function(result){
        var data = result.data;
        var wordsArr = [];
        for (var i = 0; i < data.length; i++) {
            wordsArr.push({
                name: data[i].name,
                value: Math.sqrt(data[i].y)
            });
        }
        var chart = echarts.init(document.getElementById('wordCloud'));
        var maskImage = new Image();

        var option = {
            series: [{
                type: 'wordCloud',

                // The shape of the "cloud" to draw. Can be any polar equation represented as a
                // callback function, or a keyword present. Available presents are circle (default),
                // cardioid (apple or heart shape curve, the most known polar equation), diamond (
                // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

                shape: 'star',

                // A silhouette image which the white area will be excluded from drawing texts.
                // The shape option will continue to apply as the shape of the cloud to grow.

                maskImage: maskImage,

                // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                // Default to be put in the center and has 75% x 80% size.

                // left: 'center',
                // top: 'center',
                width: 0.9*browser.windowHeight,
                // height: '90%',
                // right: null,
                // bottom: null,

                // Text size range which the value in data will be mapped to.
                // Default to have minimum 12px and maximum 60px size.

                sizeRange: [10, 50],

                // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

                rotationRange: [-90, 90],
                rotationStep: 45,

                // size of the grid in pixels for marking the availability of the canvas
                // the larger the grid size, the bigger the gap between words.

                gridSize: 2,

                // Global text style
                textStyle: {
                    normal: {
                        fontFamily: 'microsoft yahei',
                        // fontWeight: 'bold',
                        // Color can be a callback function or a color string
                        color: function () {
                            // Random color
                            return 'rgb(' + [
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160),
                                Math.round(Math.random() * 160)
                            ].join(',') + ')';
                        }
                    },
                    // emphasis: {
                    //     shadowBlur: 10,
                    //     shadowColor: '#333'
                    // }
                },

                // Data is an array. Each array item must have name and value property.
                data: wordsArr.sort(function(a, b){
                    return b.value - a.value;
                })
            }]
        };

        maskImage.onload = function () {
           option.series[0].maskImage
           chart.setOption(option);
        };

        maskImage.src = '../logo.png';
    });

    //执行窗口自适应函数
    resize();
    
});