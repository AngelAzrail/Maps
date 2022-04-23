import {Draw, Modify, Snap} from "ol/interaction";
import {setLabels} from "./setStyles";

const drawInit = (type, source, style, labels) => {
    return new Draw({
        type,
        source,
        style: (feature) => setLabels(feature, style, labels),
    })
}

const snapInit = (source) => {
    return new Snap({
        source
    })
}

const modifyInit = (source, style, labels) => {
    return new Modify({
        source,
        style: (feature) => setLabels(feature, style, labels),
    })
}

export {
    drawInit,
    snapInit,
    modifyInit
}