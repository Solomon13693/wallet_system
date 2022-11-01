var date = new Date()
var current_date = date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate();
var current_time = date.getHours() + "" + date.getMinutes();
var date_time = current_date + "" + current_time;

module.exports = date_time