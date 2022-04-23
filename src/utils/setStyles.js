import {Point} from "ol/geom";
import {formatCircleArea, formatLength, formatPolygonArea} from "./formatters/formatAreas";
import {labelStyle} from "../presets/styles/labels";

const setLabels = (feature, style, labels) => {
    if (!labels) return [style];
    const styles = [style];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label;
    switch (type) {
        case 'LineString' : {
            point = new Point(geometry.getLastCoordinate());
            label = formatLength(geometry);
            break;
        }
        case 'Circle' : {
            point = new Point(geometry.getCenter());
            label = formatCircleArea(geometry);
            break;
        }
        case 'Polygon' : {
            point = geometry.getInteriorPoint();
            label = formatPolygonArea(geometry);
            break;
        }
        default : return styles;
    }
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
    return styles;
}

export {
    setLabels
}