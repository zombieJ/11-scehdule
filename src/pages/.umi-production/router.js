import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/_renderRoutes';


let Router = DefaultRouter;

let routes = [
  {
    "path": "/",
    "component": require('../../layouts/index.jsx').default,
    "routes": [
      {
        "path": "/",
        "exact": true,
        "component": require('../index.jsx').default
      },
      {
        "path": "/schedule/calculator",
        "exact": true,
        "component": require('../schedule/calculator.ts').default
      },
      {
        "path": "/schedule/components/Days",
        "exact": true,
        "component": require('../schedule/components/Days.jsx').default
      },
      {
        "path": "/schedule/components/Preview",
        "exact": true,
        "component": require('../schedule/components/Preview.tsx').default
      },
      {
        "path": "/schedule",
        "exact": true,
        "component": require('../schedule/index.jsx').default
      },
      {
        "path": "/tmp",
        "exact": true,
        "component": require('../tmp/index.jsx').default
      }
    ]
  }
];
window.g_plugins.applyForEach('patchRoutes', { initialValue: routes });

export default function() {
  return (
<Router history={window.g_history}>
      { renderRoutes(routes, {}) }
    </Router>
  );
}
