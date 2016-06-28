;(function($, window, document,undefined){
	var heart = function(){}

	//创建各种功能 函数
	heart.prototype = {		
	
		//是否跨域
		domain:function(url){
			//简单通过http://来区分是否跨域
			if(url.indexOf("http://") != -1) return 'jsonp'; else return 'html';
		},		
		//模板引擎
		tmpl: function(template, data){
			//console.log(JSON.stringify(data))
			//调用 doT
			return doT.template(template).apply(null,[data]);
		},
		
		//模板json转换
		tmplJson:function(data, len){
			var json = {};
				//重新组装，普通第一层数组
				 for (var key in data){					 
					if(key == 'data')  json[key] = []; 
					else  json[key] = data[key];
				 }
				//重新组装，数据列
				for(var i = 0, l = data.data.length; i < l; i++){
					json.data[i] = data.data[i];
					//超出自动跳出循环
					if(i >= (len - 1)) break;
				}
			return json;
		},
		
		//分页json转换
		pageJson:function(pageRecords,pageIndex, pageTotal, pageViewNum, pageFirstEnd, pagePrevNext){
			return {"pageRecords":pageRecords,"pageIndex":pageIndex, "pageTotal":pageTotal, "pageViewNum":pageViewNum, "pageFirstEnd":pageFirstEnd, "pagePrevNext":pagePrevNext};
		},
		
		//随机数
		rounds:function(){return Math.random()*16;},
		
		//读取模板
		getTemplate : function(tplName){
			  //模板路径为空则直接返回空
			  if(tplName == '') return '';
			  
			  var $result = '';		
					$.ajax({
						dataType:"html",
						url 	: tplName,
						cache	: false,
						async	: false,
						success : function(txt,success){
							if(success){										
								$result = txt;
							}else{								
								return false;
							}
						},
						error: function(txt){							
							console.log('模板读取失败.');
						}
					});
					return $result;
		},
		//分页
		page: function(id, type, template, data){
			var json = data,
				temp = '',
				half = (json.pageViewNum+1) / 2,
				j	 = 1,
				prev = 0;
				//如果只有1页或者没有数据 则直接返回，不显示分页
				if(json.pageTotal <= 1) return false;
				
				//计算左右平均分配长度尺
				if(json.pageIndex <= half){
					prev = 0;
				}else if(json.pageTotal - json.pageIndex > (half - 1)){
					prev = json.pageIndex - half;
				}else{
					if(json.pageTotal - json.pageViewNum > 0)
						prev = json.pageTotal - json.pageViewNum;
					else
						prev = 0;
					//console.log(json.pageViewNum);
				}
				//分页种类
				if(type == 'normal' || type == ''){//默认分页
				
					//使用默认内置分页模板
					if(template == '' || typeof(template) == 'undefined'){
						//很多页则显示最后一页并....
						if(json.pageIndex >= (half + 1) && json.pageTotal > json.pageViewNum){
							temp += '<a href="javascript:void(0);" pageNum="1">1...</a>';
						}
						
						//循环页码
						for(var i = prev, l = json.pageTotal; i < l; i++){
							if((i+1) == json.pageIndex)
								temp += '<span>'+ (i+ 1) +'</span>\n';
							else
								temp += '<a href="javascript:void(0);" pageNum="'+ (i+1) +'">'+ (i+1) +'</a>\n';
								
								console.log(prev);
							if(j >= json.pageViewNum) break;
							j += 1;
						}
						
						//很多页则显示最后一页并....
						if((json.pageTotal - json.pageIndex) > (half - 1) && json.pageTotal > json.pageViewNum){
							temp += '<a href="javascript:void(0);" pageNum="'+ json.pageTotal +'">...'+ json.pageTotal +'</a>';
						}
						
						//是否显示上下一页
						if(json.pagePrevNext == true){				
							if(json.pageIndex != 1) temp = '<a href="javascript:void(0)" pageNum="'+ (json.pageIndex - 1) +'">&lt;上一页</a>' + temp;
							if(json.pageIndex !== json.pageTotal) temp = temp + '<a href="javascript:void(0)" pageNum="'+ (json.pageIndex + 1) +'">下一页&gt;</a>';				
						}	
						//是否显示首尾页	
						if(json.pageFirstEnd == true){
							if(json.pageIndex != 1) temp = '<a href="javascript:void(0)" class="first" pageNum="1">首页</a>' + temp ;
							if(json.pageIndex !== json.pageTotal) temp = temp +'<a href="javascript:void(0)" pageNum="'+ json.pageTotal +'">尾页</a>';
						}
					}else{
					//使用自定分页模板
						/*自定义*/					
						temp = this.tmpl(template, data);
					}
					//显示分页
					id.show();
				}else if(type == 'moreClick'){//点击 追加更多模式分页
				
						if(json.pageIndex < json.pageTotal){
							//使用默认内置分页模板
							if(template == '' || typeof(template) == 'undefined'){
								//没到底页时 显示分页
								id.show();
								//增加页码数
								temp = id.find('a.__pageBtn__').clone().attr('pageNum',json.pageIndex + 1);
							}
						}else
							//没有更多页 隐藏分页
						 	id.hide();						
				}
				//写入
				id.html(temp);
		},
		//建造数据与模板混合功能
		mixedTmplData:function(options){
			var 	$this			= this,				
					Defaults	= {
											id 						:	'',							//数据ID
											tplName			:	'',							//模板路径以名称
											url					:	'',							//获取数据URL
											writeId				:	'',							//回写容器ID，默认为当前ID
											writeType			:	'html',					//写入方法，可为html,append,prepend
											dataLen			:	1,							//需要多少条
											errString			:	'获取数据超时，请稍后重试...',	//错误提示
											emptyString		:	'没有找到数据',		//'没有找到数据',				//空值提示
											async				:	true,						//同步是否开启
											loading				:	true,						//加 载时loading功能是否开启
											loadingClass		:	"loading",				//loading的样子
											loadingHeight	:	200,						//loading的高度,
											page					:	false,						//分页是否开启
											pageLoadType	:	'normal',				//分页加载方式
											pageId				:	'#page',				//分页容器
											pageIndex		:	1,							//当前第几页
											pageViewNum	:	5,							//显示几个页码
											pageTplName	:	'',							//分页模板路径
											pageFirstEnd		:	false,						//显示首页链接尾页
											pagePrevNext	:	false,						//显示上一页,示下一页
											callBack			:	'',							//自定义函数
											joinString			:	'&'						//连接通配符
										};
									
			//合并参数设置
			var Options	= $.extend({}, Defaults, options);
			
			//写入唯一标识
			var WriteId	= (Options.writeId == '' || typeof(Options.writeId) == 'undefined' )? Options.id : Options.writeId;
			
			//写入功能
			var Writes		= function(str, id){
										switch (Options.writeType){					
											case 'append':
												id.append(str);
												break;
											case 'prepend':
												id.prepend(str);
												break;
											case 'html':
											default:
												id.html(str);
												break;
										}
									};
									
			//是否开启分页
			if(Options.page == true){
				Options.url += Options.joinString + 'page=' +Options.pageIndex;
				//隐藏分页容器
				$(Options.pageId).hide();
			}
			
			//发送数据请求
			$.ajax({
				type				: "GET",
				dataType	 	: this.domain(Options.url),
				jsonp			: 'jsonCallback',
				cache			: false,
				url				: Options.url + Options.joinString + 'dataLen='+ Options.dataLen + Options.joinString + this.rounds(),
				async			: Options.async,
				success 		: function (json,status) {
					if(status){
						var $json;
						//返回数据为为非JSON，则强制转成JSON
						if(typeof(json) == "object") $json = json; else $json =  (new Function("", "return " + json))();
												
						if($json.success == true){
							//清除loading
							if(Options.loading == true) $(WriteId).find('.loading').remove();
								//
								try{
									//写入混合后的数据
									Writes($this.tmpl($this.getTemplate(Options.tplName),$this.tmplJson($json, Options.dataLen)), $(WriteId));
									//调用 callback	funciton
									if(Options.callBack != '' && typeof(Options.callBack) != 'undefined'){
										setTimeout(function(){
											var callB = Options.callBack.split(/[ ,]/);
											for(var i = 0,l = callB.length; i < l; i++){
												new Function("", "return " + callB[i])()($(WriteId),$json);
											}
										},100);
									}
								}catch(err){
									//打印错误
									console.log('try catch [ ' +Options.id + ' ]的 ' + err.name + ' : ' + err.message);
								}
								//分页功能
								if(Options.page == true){
										//调用并写入分页
										$this.page(
												$(Options.pageId),
												Options.pageLoadType,
												$this.getTemplate(Options.pageTplName), 
												$this.pageJson($json.records, $json.page, $json.total, Options.pageViewNum, Options.pageFirstEnd, Options.pagePrevNext,  Options.pageViewNum)
										);										
										//分页点击
										$(Options.pageId +' a').unbind('click').bind('click',function(){
											//点击页码翻页
											$(Options.id).heart_getData({pageIndex:$(this).attr('pageNum')});
										});
								}
						}else{
							//如果success 为 false 则打印出返回的代码错误
							console.log('success=false : '+ $json.code + '\n' + $json.message);
						}
					}
				},
				error				: function(XMLHttpRequest, textStatus, errorThrown) {
					console.log('ajax error : '+ XMLHttpRequest + '\n' + textStatus + '\n' + errorThrown);
				},
				beforeSend	: function(){
					if(Options.loading == true) Writes('<div style="height:'+ Options.loadingHeight +'px;" class="'+ Options.loadingClass +'" />', $(WriteId), Options.writeType);
				}
			});			
		}
		
	}
	
	//建立插件
	//获取数据 + 模板 + 混合组装后回写入容器 （可配置分页，分页模式，数据列个数等）
    $.fn.heart_getData = function(options) {
		
		return this.each(function(){
			//获取参数
			var setDataParam = (new Function("", "return " + ($(this).attr('rel-setDataParam'))))(),//设置
				  setDataUrl		= $(this).attr('rel-getDataUrl');//数据源地址
				  /*======================================================================*/
				  //如果setDataUrl 为空 则兼容 旧版本 设置
				  setDataUrl		= (setDataUrl == '' || typeof(setDataUrl) == 'undefined')?  $(this).attr('rel-getUrl') :  setDataUrl;
				  /*======================================================================*/
				   
				//关键性参数没有设置将回滚，并提示，不再单次继续执行
				if(typeof(setDataParam) == 'undefined' || setDataParam == '')
					console.log('没有设置关键性参数 -> "setDataParam"，请检查  代码段[　' + $('<div>').append($(this).clone().html('')).html() + '　]');

				if(typeof(setDataUrl) == 'undefined' || setDataUrl == '')
					console.log('没有设置关键性参数 -> "getDataUrl"，请检查  代码段[　' + $('<div>').append($(this).clone().html('')).html() + '　]');

				if(typeof(setDataParam) == 'undefined' || setDataParam == '' || typeof(setDataUrl) == 'undefined' || setDataUrl == '')
					return true;
				
				if(typeof(setDataParam.tplName) == 'undefined' || setDataParam.tplName == ''){
					console.log('没有设置模板路径 -> "tplName"，请检查  代码段[　' + $('<div>').append($(this).clone().html('')).html() + '　]');	
					return true;
				}

				//拼接数据源地址,  数据源类型  THIS_DATA_TYPE =  Local （本地）｜Development （开发）| Testing（测试） | Pre_Production （预生产）｜ Production  （生产）
				/*
					public.js 中可以这样设置
					
					THIS_DATA_TYPE =  'Local （本地）｜Development （开发）| Testing（测试） | Pre_Production （预生产）| Production  （生产）';
					$Local_root = '';
					$Development_root = '';
					$Testing_root = '';
					$Production_root = '';
				*/
					
					if(setDataUrl.substring(0,7) != 'http://'){
						if(setDataUrl.substring(0,3) == '../'){
							//默认本地数据源
							setDataUrl = setDataUrl;
						}else{
							switch(THIS_DATA_TYPE){
									case 'Local':
										setDataUrl = $Local_root + setDataUrl;	
										break;
									case 'Development'://开发环境
										setDataUrl = $Development_root + setDataUrl;
										break;
									case 'Testing'://测试环境
										setDataUrl = $Testing_root + setDataUrl;
										break;
									case 'Pre_Production'://预生产环境
										setDataUrl = $Pre_Production_root + setDataUrl;
										break;	
									case 'Production'://生产环境
										setDataUrl = $Production_root + setDataUrl;
										break;							
							}
						}
					}else{
								//远程异地数据源，不需要链接URL前缀		
								setDataUrl = setDataUrl;				
					}

				//是否为分页点击，自带pageIndex参数
				if(typeof(options) != 'undefined'){
					var pageIndex = (options.pageIndex != '')? options.pageIndex : setDataParam.pageIndex
				}
			var heart_ = new heart();
				 heart_.mixedTmplData({
							id 						:	'#' + this.id,							
							writeId				:	setDataParam.writeId,
							url					:	setDataUrl,
							tplName			:	setDataParam.tplName,
							writeType			:	setDataParam.writeType,
							dataLen			:	setDataParam.dataLen,
							errString			:	setDataParam.errString,
							emptyString		:	setDataParam.emptyString,
							async				:	setDataParam.async,
							loading				:	setDataParam.loading,
							loadingClass		:	setDataParam.loadingClass,
							loadingHeight	:	setDataParam.loadingHeight,
							page					:	setDataParam.page,
							pageLoadType	:	setDataParam.pageLoadType,
							pageId				:	setDataParam.pageId,
							pageIndex		:	pageIndex,
							pageTplName	:	setDataParam.pageTplName,
							pageViewNum	:	setDataParam.pageViewNum,
							pageFirstEnd		:	setDataParam.pageFirstEnd,
							pagePrevNext	:	setDataParam.pagePrevNext,
							callBack			:	setDataParam.callBack,
							joinString			:	setDataParam.joinString
						});				 
		});		
	}
	//读取预先准备好的数据，进行混合模板，再写入
	$.fn.heart_getPrependData = function(data, callBack){

			var $this = $(this), tplName = $this.attr('rel-tplName');
	
			  //模板路径为空则直接返回空
			  if(tplName == '') return '';
			  
			  var $result = '';
					$.ajax({
						dataType:"html",
						url 	: tplName,
						cache	: false,
						async	: false,
						success : function(txt,success){
							if(success){												
								if(typeof(callBack) != 'undefined') callBack($this, txt, data);
							}else{								
								return false;
							}
						},
						error: function(txt){							
							console.log('模板读取失败.');
						}
					});
	}
})(jQuery, window, document);