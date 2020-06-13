import {listConstants, tsConstants} from '../constants/constants';
import {tsServices} from '../backend/testsuiteServices';

export const listActions = {
    itemSelect,
    setAppBarMenu
};

function itemSelect(item){
    return dispatch=>{
        switch (item.name) {
            case "Projects":
                dispatch(getProjectDetails(item));
                break;
            case "Releases":
                dispatch(getReleaseDetails(item));
                break;
            case "Test Suites":            
                tsServices.getAllTSById()
                    .then(ts=> {                        
                        dispatch(getTSByIdSuccess(ts));
                    })
                    .catch(err=>{
                        dispatch(getTSByIdFailure(err));
                    })            
                break;                
            default:
                break;
        }
    };
    function getTSByIdSuccess(ts){return { type: tsConstants.GETALL_TS_SUCCESS, ts}};
    function getTSByIdFailure(err){return { type: tsConstants.GETALL_TS_FAILURE, err}};
    function getReleaseDetails(item){return { type: listConstants.ITEM_CLICKED, item}};
    function getProjectDetails(item){return { type: listConstants.ITEM_CLICKED, item}};
}
function setAppBarMenu(open){
    return {type: listConstants.SET_APPBAR, open}
}

