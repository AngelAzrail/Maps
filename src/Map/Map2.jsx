import React, {Component} from "react";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Draw, Modify, Snap} from "ol/interaction";
import {Fill, RegularShape, Stroke, Style} from "ol/style";
import {GeoJSON} from "ol/format";
import {getArea} from "ol/sphere";
import {Point} from "ol/geom";

const jsonObj = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:3857',
        },
    },
    'features': [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [0, 0],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [4e6, -2e6],
                    [8e6, 2e6],
                ],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [4e6, 2e6],
                    [8e6, -2e6],
                ],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [-5e6, -1e6],
                        [-3e6, -1e6],
                        [-4e6, 1e6],
                        [-5e6, -1e6],
                    ],
                ],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'MultiLineString',
                'coordinates': [
                    [
                        [-1e6, -7.5e5],
                        [-1e6, 7.5e5],
                    ],
                    [
                        [1e6, -7.5e5],
                        [1e6, 7.5e5],
                    ],
                    [
                        [-7.5e5, -1e6],
                        [7.5e5, -1e6],
                    ],
                    [
                        [-7.5e5, 1e6],
                        [7.5e5, 1e6],
                    ],
                ],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'MultiPolygon',
                'coordinates': [
                    [
                        [
                            [-5e6, 6e6],
                            [-3e6, 6e6],
                            [-3e6, 8e6],
                            [-5e6, 8e6],
                            [-5e6, 6e6],
                        ],
                    ],
                    [
                        [
                            [-2e6, 6e6],
                            [0, 6e6],
                            [0, 8e6],
                            [-2e6, 8e6],
                            [-2e6, 6e6],
                        ],
                    ],
                    [
                        [
                            [1e6, 6e6],
                            [3e6, 6e6],
                            [3e6, 8e6],
                            [1e6, 8e6],
                            [1e6, 6e6],
                        ],
                    ],
                ],
            },
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'GeometryCollection',
                'geometries': [
                    {
                        'type': 'LineString',
                        'coordinates': [
                            [-5e6, -5e6],
                            [0, -5e6],
                        ],
                    },
                    {
                        'type': 'Point',
                        'coordinates': [4e6, -5e6],
                    },
                    {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [1e6, -6e6],
                                [3e6, -6e6],
                                [2e6, -4e6],
                                [1e6, -6e6],
                            ],
                        ],
                    },
                ],
            },
        },
    ],
}

export default class Maps extends Component {
    // labelStyle = new Style({
    //     text: new Text({
    //         font: '14px Calibri,sans-serif',
    //         fill: new Fill({
    //             color: 'rgba(255, 255, 255, 1)',
    //         }),
    //         backgroundFill: new Fill({
    //             color: 'rgba(0, 0, 0, 0.7)',
    //         }),
    //         padding: [3, 3, 3, 3],
    //         textBaseline: 'bottom',
    //         offsetY: -15,
    //     }),
    //     image: new RegularShape({
    //         radius: 8,
    //         points: 3,
    //         angle: Math.PI,
    //         displacement: [0, 10],
    //         fill: new Fill({
    //             color: 'rgba(0, 0, 0, 0.7)',
    //         }),
    //     }),
    // });

    styleFunction(feature) {
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        let point;
        if (type === 'Polygon')
            point = geometry.getInteriorPoint();
        else point = new Point(geometry.getLastCoordinate())
        const label = getArea(geometry);
        // this.labelStyle.getText().setText(label);
        // this.labelStyle.setGeometry(point);
        return this.labelStyle;
    }

    source = new VectorSource({
        // готовая мапа с полигонами
        // features: new GeoJSON().readFeatures(jsonObj),
    });
    vector = new VectorLayer({
        source: this.source,
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2,
            }),
        })
    });
    raster = new TileLayer({
        source: new OSM(),
    });
    constructor(props) {
        super(props);

        this.state = {features: []};

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

        this.draw = new Draw({
            type: 'Polygon',
            source: this.source,
            // style:  (feature) => {
            //     return this.styleFunction(feature)
            // }
        })

        // для редатирования/рисования на ходу
        this.snap = new Snap({
            source: this.source,
        })

        // изменение существующих
        this.modify = new Modify({
            source: this.source,
        })
    }

    componentDidMount() {
        // привязка мапы к элементу
        this.map.setTarget('map');

        // запуск действий
        this.map.addInteraction(this.draw);
        this.map.addInteraction(this.snap);
        this.map.addInteraction(this.modify);

        // обновление стейта
        this.draw.on('drawend', (e) => {
            this.setState({features: [...this.state.features, e.feature.getGeometry()]});
            // this.source.addFeature(e.feature);
        });
    }


    render() {
        return (
            <div id='map' style={{width: '100%', height: '100vh'}}/>
        )
    }
}