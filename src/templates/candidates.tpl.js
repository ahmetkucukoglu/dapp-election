(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['candidates'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " class=\"success\" ";
},"3":function(container,depth0,helpers,partials,data) {
    return "    <span class=\"label label-success\">Kazandı!</span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {});

  return "<tr data-candidate-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.isWinner : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n  <td><img width=\"45\" src=\"https://ipfs.io/ipfs/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.photoHash : stack1), depth0))
    + "\" /></td>\r\n  <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "</td>\r\n  <td class=\"candidate-name\"> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.name : stack1), depth0))
    + " \r\n"
    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.isWinner : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </td>\r\n  <td class=\"vote-count\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.voteCount : stack1), depth0))
    + "</td>\r\n  <td>\r\n    <button type=\"button\" class=\"btn btn-primary btn-vote\" onclick=\"App.castVote('"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.candidate : depth0)) != null ? stack1.id : stack1), depth0))
    + "');\">Oy ver</button>\r\n  </td>\r\n</tr>";
},"useData":true});
})();