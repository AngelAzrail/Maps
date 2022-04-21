import {Point} from "ol/geom";
import {formatArea, formatLength} from "./formatters/formatAreas";
import {labelStyle} from "../presets/styles/labels";

const setLabels = (feature, style) => {
    const styles = [style];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label;
    if (type === 'Polygon') {
        point = geometry.getInteriorPoint();
        label = formatArea(geometry);
    } else if (type === 'LineString') {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
    }
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
    return styles;
}

export {
    setLabels
}