/**
This provides easy access to important fields in OpenSpending models.
e.g.
function getSubprogrammeDimension(model) {
    return getDimension(model, "activity");
}

or e.g.
function getProgNameRef(model) {
    return getRef(model, getProgDimension(model), "label");
}
*/

/*
Get the dimension name for a given hierarchy name and level, where
a hierarchy name corresponds to an OpenSpending Type.

A level is the position of the dimension in the hierarchy, e.g.
Programme might be level 0 in the activity hierarchy, while
Subprogramme might be level 1.
*/
function getDimension(model, hierarchyName, level) {
    if (typeof(level) === 'undefined')
        level = 0;

    return model.hierarchies[hierarchyName].levels[level];
}

/*
Get the ref for a given dimension and type, where a ref is
like the column name in a CSV or the field name in an array of JSON
objects.

The ref type can be code or label.
*/
function getRef(model, dimensionName, refType) {
    return model.dimensions[dimensionName][refType + "_ref"];
}
