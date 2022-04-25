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
import {toGeometry} from "ol/render/Feature";
import _ from "lodash";
import Geocoder from 'ol-geocoder'

import 'ol-geocoder/dist/ol-geocoder.css';
import './Map.css'

const mousePositionControl = new MousePosition({
    projection: 'EPSG:4326',
    coordinateFormat: createStringXY(4),
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
});

const jsonObj = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [45.68905413150787, 43.312250816036666],
                        [45.689281288941864, 43.31247952198527],
                        [45.68962932389696, 43.312296097447],
                        [45.68940386117902, 43.312068016718506]
                    ]
                ]
            }
        },
    ]
}

const obj2 = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[45.68905413150787,43.31225081603668],[45.68928128894187,43.31247952198527],[45.68962932389695,43.31229609744699],[45.68940386117902,43.31206801671851]]]},"properties":null},{"type":"Feature","geometry":{"type":"Point","coordinates":[45.619194524765,42.95064151225523]},"properties":null},{"type":"Feature","geometry":{"type":"Point","coordinates":[45.962281244277946,43.09730722575867]},"properties":null},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[45.954288261413566,42.799736774024666],[46.19112731742858,43.23647098383597]]},"properties":null},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[45.37390114593505,43.30808095373774],[45.4430699520111,43.29694698571191],[45.38970472145079,43.26765007308498],[45.37390114593505,43.30808095373774]]]},"properties":null}]}


export default class Maps extends Component {
    draw;
    modify;
    snap;
    style = areaDefStyle;

    source = new VectorSource();

    select = new Select();

    constructor(props) {
        super(props);

        this.state = {features: [], zoom: 9, type: geometryTypes.Point, show: false};

        // порядок слоев в мапе важен
        // слои идут по порядку отображения (сзади растр спереди вектор для отрисовки
        this.vector = new VectorLayer({
            source: this.source,
            style: (features) => setLabels(features, this.style, this.state.zoom > 10),
        });
        this.raster = new TileLayer({
            source: new OSM(),
        });

        this.map = new Map({
            controls: [mousePositionControl],
            layers: [
                this.raster,
                this.vector
            ],
            view: new View({
                center: fromLonLat([45.668, 43.312]),
                constrainOnlyCenter: true,
                // minZoom: 9,
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
        this.parseToGeo(jsonObj);

        const geocoder = new Geocoder('nominatim', {
            provider: 'osm',
            lang: 'ru-RU', //en-US, fr-FR
            placeholder: 'Search for ...',
            targetType: 'text-input',
            limit: 5,
            keepOpen: true
        });
        this.map.addControl(geocoder);
        this.map.on('singleclick', (e) => {
            console.log(e);
        })
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
        const features = _.cloneDeep(this.source.getFeatures());
        features.forEach(feature => {
            feature.setGeometry(feature.getGeometry().transform('EPSG:3857','EPSG:4326'));
        });
        const geojsonStr = writer.writeFeatures(features);
        console.log(geojsonStr);
        features.forEach(feature => {
            feature.setGeometry(feature.getGeometry().transform('EPSG:4326', 'EPSG:3857'));
        });
    }

    parseToGeo(json) {
        new GeoJSON().readFeatures(json).forEach(feature => {
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
                <button className='btn' onClick={() => this.edit()}>Edit</button>
                <button className='btn' onClick={() => this.choose()}>Choose</button>
                <button className='btn' onClick={() => this.saveFeatures()}>Save</button>
                <button className='btn' onClick={() => this.source.clear()}>Clear Polygons</button>
            </>
        )
    }
}