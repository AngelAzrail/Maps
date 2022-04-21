import {Draw, Modify, Snap} from "ol/interaction";
import {setLabels} from "./setStyles";

const drawInit = (type, source, style) => {
    return new Draw({
        type,
        source,
        style: (feature) => setLabels(feature, style),
    })
}

const snapInit = (source) => {
    return new Snap({
        source
    })
}

const modifyInit = (source, style) => {
    return new Modify({
        source,
        style: (feature) => setLabels(feature, style),
    })
}

export {
    drawInit,
    snapInit,
    modifyInit
}