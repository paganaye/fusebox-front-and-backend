'use strict';
import {Request, Response, Router, NextFunction } from 'express';

const api =  Router()

api.get('/add', function(req:Request, res:Response, _next:NextFunction) {
    const a = req.query.a as string;
    const b = req.query.b as string;
    const result = parseInt(a)+parseInt(b);
    res.end(result.toString());
  });


export default  api;
