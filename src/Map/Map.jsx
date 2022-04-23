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
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            42.572265625,
                            80.722598828043374
                        ],
                        [
                            39.90234375,
                            57.657157596582984
                        ],
                        [
                            44.384765625,
                            55.57834467218206
                        ],
                        [
                            45.52734375,
                            58.99531118795094
                        ],
                        [
                            41.572265625,
                            58.722598828043374
                        ]
                    ]
                ]
            }
        },
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
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        58.447265625,
                        57.89149735271034
                    ],
                    [
                        63.6328125,
                        60.88770004207789
                    ],
                    [
                        55.37109374999999,
                        61.689872200460016
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "marker-color": "#7e7e7e",
                "marker-size": "medium",
                "marker-symbol": "circle"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    64.16015624999999,
                    59.28833169203345
                ]
            }
        }
    ]
}

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

        this.state = {features: [], zoom: 5, type: geometryTypes.Point, show: false};

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
                <button onClick={() => this.source.clear()}>Clear Polygons</button>
            </>
        )
    }
}