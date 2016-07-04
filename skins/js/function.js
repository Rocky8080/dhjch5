// JavaScript Document
//获取指定URL参数的值 
function getQueryString(name) {
   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
   var r = window.location.search.substr(1).match(reg);
   if (r!=null) return (r[2]); return null;
}
//替换Path路径
function repPath(path, repString){
	var reg=new RegExp("@","g");
	return path.replace(reg, 'l_d_' + repString);  
}
//转换坐标JSON数组
function setLocationFun(json){
	var j = [];
	for(var i = 0,len = json.length; i < len; i++){
		j[i] = json[i].l;
	}
	return j.join('|');
}