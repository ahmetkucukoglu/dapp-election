(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['candidates'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<tr>\r\n  <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "</td>\r\n  <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.name : stack1), depth0))
    + "</td>\r\n  <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.voteCount : stack1), depth0))
    + "</td>\r\n  <td><button type=\"button\" data-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "\" class=\"btn btn-primary btn-vote\" onclick=\"App.castVote('"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "');\">Vote</button></td>\r\n</tr>";
},"useData":true});
})();