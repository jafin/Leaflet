// eslint-disable-next-line no-unused-vars
import {Point} from '../Leaflet';

export class LeafletHTMLElement extends HTMLElement {
	constructor() {
		super();
		/**
         * @type {Point}
         */
		// eslint-disable-next-line camelcase
		this._leaflet_pos = undefined;
	}
}
