/**
This provides semantic function names for accessing columns standard
in in vulekamali, the column types used to upload vulekamali data to OpenSpending.
*/

function getProgNameRef(model) {
    return getRef(model, getProgDimension(model), "label");
}

function getProgDimension(model) {
    return getDimension(model, "activity");
}

function getSubprogNameRef(model) {
    return getRef(model, getSubprogDimension(model), "label");
}

function getSubprogDimension(model) {
    return getDimension(model, "activity", 1);
}

function getEconClass4Ref(model) {
    return getRef(model, getEconClassDimension(model), "label");
}

function getEconClassDimension(model) {
    return getDimension(model, "economic_classification", 3);
}
