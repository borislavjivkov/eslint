/**
 * @fileoverview Rule to flag adding properties to native object's prototypes.
 * @author David Nelson
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var BUILTINS = [
    "Object", "Function", "Array", "String", "Boolean", "Number", "Date",
    "RegExp", "Error", "EvalError", "RangeError", "ReferenceError",
    "SyntaxError", "TypeError", "URIError"
];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    "use strict";

    return {

        // handle the Array.prototype.extra style case
        "AssignmentExpression": function(node) {
            var lhs = node.left, affectsProto;

            if (lhs.type !== "MemberExpression" || lhs.object.type !== "MemberExpression") { return; }

            affectsProto = lhs.object.computed ?
                lhs.object.property.type === "Literal" && lhs.object.property.value === "prototype" :
                lhs.object.property.name === "prototype";

            if (!affectsProto) { return; }

            BUILTINS.forEach(function(builtin) {
                if (lhs.object.object.name === builtin) {
                    context.report(node, builtin + " prototype is read only, properties should not be added.");
                }
            });
        },

        // handle the Object.defineProperty(Array.prototype) case
        "CallExpression": function(node) {

            var callee = node.callee,
                subject,
                object;

            // only worry about Object.defineProperty
            if (callee.type === "MemberExpression" &&
                callee.object.name === "Object" &&
                callee.property.name === "defineProperty") {

                // verify the object being added to is a native prototype
                subject = node.arguments[0];
                object = subject.object;

                if (object &&
                    object.type === "Identifier" &&
                    (BUILTINS.indexOf(object.name) > -1) &&
                    subject.property.name === "prototype") {

                    context.report(node, object.name + " prototype is read only, properties should not be added.");
                }
            }

        }
    };

};