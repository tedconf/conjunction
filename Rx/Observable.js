/**
 * Facade for Observable support.
 */

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';

export {
  Observable
};
