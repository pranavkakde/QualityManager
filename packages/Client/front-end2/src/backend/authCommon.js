export const fetchOptions=(requestOptions)=>{      
    const token = localStorage.getItem('token');
    requestOptions.headers = {
        ...requestOptions.headers,
        'Authrization': `Bearer ${token}`
    }
    return requestOptions;
}