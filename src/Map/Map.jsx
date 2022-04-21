import React, {Component} from "react";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import {drawInit, modifyInit, snapInit} from "../utils/map.functions";
import {geometryTypes} from '../enums/GeometryTypes'
import {setLabels} from "../utils/setStyles";
import {areaStyle} from "../presets/styles/areas";
import {Select} from "ol/interaction";

export default class Maps extends Component {
    draw;
    modify;
    snap;
    map;
    style = areaStyle;

    source = this.props.source;

    select = new Select();

    vector = new VectorLayer({
        source: this.source,
        style: (features) => setLabels(features, this.style),
    });
    raster = new TileLayer({
        source: new OSM(),
    });

    constructor(props) {
        super(props);

        this.state = {features: [], zoom: 2};

        // порядок слоев важен
        // слои идут по порядку отображения (сзади растр спереди вектор для отрисовки
        this.map = new Map({
            layers: [
                this.raster,
                this.vector
            ],
            view: new View({
                center: [0, 0],
                zoom: 1,
            })
        });
    }

    init() {
        this.draw = drawInit(geometryTypes.Polygon, this.source, this.style);
        this.snap = snapInit(this.source);
        this.modify = modifyInit(this.source, this.style);
        this.map.addInteraction(this.modify);
    }

    choose() {
        this.map.addInteraction(this.select);
        this.map.removeInteraction(this.draw);
    }

    edit() {
        this.map.addInteraction(this.draw);
        this.map.removeInteraction(this.select);
    }

    componentDidMount() {
        // привязка мапы к элементу
        this.map.setTarget('map');
        this.init();
    }

    render() {
        return (
            <>
                <div id='map' style={{width: '100%', height: '90vh'}}/>
                <button onClick={() => this.edit()}>Edit</button>
                <button onClick={() => this.choose()}>Choose</button>
                <button onClick={() => this.source.clear()}>Clear Polygons</button>
            </>
        )
    }
}