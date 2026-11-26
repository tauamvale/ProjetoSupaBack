//import express from 'express';
const express = require('express');

//import createClient from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
//import {createClient} from '@supabase/supabase-js'
const supabaseClient = require('@supabase/supabase-js');

//import morgan from 'morgan';
const morgan = require('morgan');

//import bodyParser from "body-parser";
const bodyParser = require('body-parser');

//import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const app = express();

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration


// using morgan for logs
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const supabase = 
    supabaseClient.createClient('https://bvojhirhkxepaosvkrqy.supabase.co/', 
        'sb_publishable_rzvOY8Aff4oShXP9YH4X9Q_mzaiK76l')


const sendError = (res, error, status = 400) =>
    res.status(status).json({error: error.message});

app.get('/products', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .select()
        .order('id');
    if (error) return sendError(res, error, 500);
    res.json(data);
});

app.get('/products/search', async (req, res) => {
    const term = String(req.query.name || '').trim();
    if (!term) return res.json([]);
    // escape the LIKE wildcards typed by the user
    const safe = term.replace(/[\\%_]/g, '\\$&');
    const {data, error} = await supabase
        .from('products')
        .select()
        .ilike('name', `%${safe}%`)
        .order('id');
    if (error) return sendError(res, error, 500);
    res.json(data);
});

app.get('/products/:id', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .select()
        .eq('id', req.params.id);
    if (error) return sendError(res, error, 500);
    if (!data || data.length === 0) {
        return res.status(404).json({error: 'Product not found'});
    }
    res.json(data);
});

app.post('/products', async (req, res) => {
    const {error} = await supabase
        .from('products')
        .insert({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        });
    if (error) return sendError(res, error);
    res.status(201).json({message: 'created'});
});

app.put('/products/:id', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        })
        .eq('id', req.params.id)
        .select();
    if (error) return sendError(res, error);
    if (!data || data.length === 0) {
        return res.status(404).json({error: 'Product not found (or update blocked by the table policy)'});
    }
    res.json({message: 'updated'});
});

app.delete('/products/:id', async (req, res) => {
    const {data, error} = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .select();
    if (error) return sendError(res, error);
    if (!data || data.length === 0) {
        return res.status(404).json({error: 'Product not found (or delete blocked by the table policy)'});
    }
    res.json({message: 'deleted'});
});

app.get('/', (req, res) => {
    res.send("Hello I am working my friend Supabase <3");
});

//app.get('*', (req, res) => {
  //  res.send("Hello again I am working my friend to the moon and behind <3");
//});

app.listen(3000, () => {
    console.log(`> Ready on http://localhost:3000`);
});