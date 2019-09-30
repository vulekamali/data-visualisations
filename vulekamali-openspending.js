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
