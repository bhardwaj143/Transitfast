import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import {  validators } from '../../middleware/index.js';
import  adminAuth  from '../../middleware/auth/admin.js';
import upload from '../../middleware/upload/index.js';
import { addRequest, findAllRequests, findRequestById, updateRequest, deleteRequest, getRequestsCount, sendEmail  } from '../../services/index.js';

//Response Status code
const { SUCCESS, BAD_REQUEST } = statusCodes;

//Response Messages
const { REQUEST_ADDED, FETCH_ALL_REQUESTS, FETCH_REQUEST, UPDATE_REQUEST, DELETE_REQUEST, REQUEST_ALREADY_SENT } = responseMessages;

const router = Router();


//request Added
router.post('/sent', catchAsyncAction(async (req, res) => {
    let requestData = await findRequestById({vehicleId: req.body.vehicleId, requestedTo: req.body.requestedTo});
    if(requestData){
        return makeResponse(res, BAD_REQUEST, false, REQUEST_ALREADY_SENT);
    } else {
        Promise.all(
            [
                sendEmail({
                    to: req.body.requestedToEmail,
                    subject: 'Vehicle Request',
                    text: `Your Vehicle ${req.body.requestStatus} By Super-Admin`
                }),
            ]
        )
        let request = await addRequest(req.body);
        return makeResponse(res, SUCCESS, true, REQUEST_ADDED, request);
    }    
}));

//Get all requests
router.get('/', catchAsyncAction(async (req, res) => {
    let page = 1,
        limit = 10,
        skip = 0
    if (req.query.page) page = req.query.page
    if (req.query.limit) limit = req.query.limit
    skip = (page - 1) * limit
    let request = await findAllRequests({ isDeleted: false}, parseInt(skip), parseInt(limit));
    let requestCount = await getRequestsCount({ isDeleted: false});
    return makeResponse(res, SUCCESS, true, FETCH_ALL_REQUESTS, request,{
        current_page: page,
        total_records: requestCount,
        total_pages: Math.ceil(requestCount / limit),
    });
}));

//Get request ById
router.get('/:id', catchAsyncAction(async (req, res) => {
    let request = await findRequestById({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_REQUEST, request);
}));

//Update request
router.patch('/:id', catchAsyncAction(async (req, res) => {
    let updatedRequest = await updateRequest({ _id: req.params.id }, req.body);
    return makeResponse(res, SUCCESS, true, UPDATE_REQUEST, updatedRequest);
}))

//Delete request
router.delete('/:id', catchAsyncAction(async (req, res) => {
    let request = await deleteRequest({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, DELETE_REQUEST, []);
}));



export const requestsController = router;
