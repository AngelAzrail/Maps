import React, {Component} from "react";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import {drawInit, modifyInit, snapInit} from "../utils/map.functions";
import {geometryTypes} from '../enums/GeometryTypes'
import {setLabels} from "../utils/setStyles";
import {areaDefStyle} from "../presets/styles/areas";
import {Select} from "ol/interaction";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import {defaults as defaultControls, MousePosition} from "ol/control";
import {createStringXY} from "ol/coordinate";
import {fromLonLat} from "ol/proj";

const mousePositionControl = new MousePosition({
    projection: 'EPSG:4326',
    coordinateFormat: createStringXY(4),
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
});

const jsonObj = {
    "type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[5086082.240745769,5359621.021214579],[5086107.527795651,5359656.010995173],[5086146.270869629,5359627.948818478],[5086121.172474676,5359593.054795595]]]},"properties":null},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[5086082.240745769,5359621.021214579],[5086107.527795651,5359656.010995173],[5086146.270869629,5359627.948818478],[5086121.172474676,5359593.054795595]]]},"properties":null},{"type":"Feature","geometry":{"type":"GeometryCollection","geometries":[]},"properties":null},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[5086619.30389774,5359752.397160985],[5086669.214776468,5359797.351373135],[5086692.29901561,5359795.643490976],[5086736.538436599,5359745.375216668],[5086737.046699986,5359725.040286972],[5086685.542188506,5359677.52864579],[5086662.777261809,5359677.591629437],[5086618.622795507,5359729.765525263],[5086619.30389774,5359752.397160985]]]},"properties":null}]}

export default class Maps extends Component {
    draw;
    modify;
    snap;
    map;
    style = areaDefStyle;

    source = new VectorSource();

    select = new Select();

    vector = new VectorLayer({
        source: this.source,
        style: (features) => setLabels(features, this.style, this.state.zoom > 10),
    });
    raster = new TileLayer({
        source: new OSM(),
    });

    constructor(props) {
        super(props);

        this.state = {features: [], zoom: 9, type: geometryTypes.Point, show: false};

        // порядок слоев важен
        // слои идут по порядку отображения (сзади растр спереди вектор для отрисовки
        this.map = new Map({
            controls: defaultControls().extend([mousePositionControl]),
            layers: [
                this.raster,
                this.vector
            ],
            view: new View({
                center: fromLonLat([45.668, 43.312]),
                constrainOnlyCenter: true,
                minZoom: 9,
                zoom: this.state.zoom,
            })

        });
    }

    handleSelect(e) {
        this.setState({type: e.target.value});
        this.map.removeInteraction(this.draw);
        this.draw = drawInit(e.target.value, this.source, this.style, this.state.zoom > 10);
        this.map.addInteraction(this.draw);
    }

    init() {
        this.snap = snapInit(this.source);
        this.modify = modifyInit(this.source, this.style, this.state.zoom > 10);
        this.parse(jsonObj);
    }

    choose() {
        this.setState({show: false});
        this.map.addInteraction(this.select);
        this.map.removeInteraction(this.draw);
        this.map.removeInteraction(this.modify);
    }

    edit() {
        this.setState({show: true});
        this.draw = drawInit(this.state.type, this.source, this.style, this.state.zoom > 10);
        this.map.addInteraction(this.draw);
        this.map.addInteraction(this.modify);
        this.map.removeInteraction(this.select);
    }

    saveFeatures() {
        const writer = new GeoJSON();
        const geojsonStr = writer.writeFeatures(this.source.getFeatures());
        console.log(geojsonStr);
    }

    parse(json) {
        return new GeoJSON().readFeatures(json).forEach(feature => {
            feature.setGeometry(feature.getGeometry().clone().transform('EPSG:4326', 'EPSG:3857'));
            this.source.addFeature(feature);
        })
    }

    componentDidMount() {
        // привязка мапы к элементу
        this.map.setTarget('map');
        this.typeSelect = document.getElementById('type');
        this.init();
        this.choose();
        this.map.getView().on('change:resolution', (event) => {
            this.setState({zoom: event.target.values_.zoom});
        });
    }

    render() {
        const { type, show } = this.state;
        return (
            <>
                <div id='map' style={{width: '100%', height: '90vh'}}/>
                <div id='mouse-position'/>
                <select id='type' defaultValue={type} onChange={(e) => this.handleSelect(e)} hidden={!show}>
                    <option value={geometryTypes.Point}>Point</option>
                    <option value={geometryTypes.LineString}>LineString</option>
                    <option value={geometryTypes.Polygon}>Polygon</option>
                    <option value={geometryTypes.Circle}>Circle</option>
                </select>
                <button onClick={() => this.edit()}>Edit</button>
                <button onClick={() => this.choose()}>Choose</button>
                <button onClick={() => this.saveFeatures()}>Save</button>
                <button onClick={() => this.source.clear()}>Clear Polygons</button>
            </>
        )
    }
}