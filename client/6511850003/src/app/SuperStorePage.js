import axios from 'axios';
import React, { useState, useEffect } from 'react';

function SuperStorePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [productName, setProductName ]= useState("");

  const [projectFilter, setProjectFilter] = useState([]);
  const handleOnCheckedChange = (index) => {
    const updateProjectFilter = projectFilter.map((el, i) =>
      index === i ? !el : el
    );
    setProjectFilter(updateProjectFilter);
    let project = {};
    keys.forEach((key, index) => {
      project[key] = updateProjectFilter[index] ? 1 : 0;
    })
    const request = {
      project: project
    }
    console.log(request);
    axios.get('http//localhost:5000/getFillterData',{
        params: request
    }).then((response) => { 
        
    });

  }

  useEffect(() => {
    setProjectFilter(new Array(keys.length).fill(true));
  }, [keys]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/getAllData');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
      setKeys(Object.keys(jsonData[0]));
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <h1>SuperStore</h1>
      <div className="grid grid-cols-8 gap-2 mt-4">
        {keys.map((key,index) => (
          <label key={key} className="label cursor-pointer justify-start">
            <input type="checkbox"
              checked={projectFilter[index]}
              onChange={() => handleOnCheckedChange(index)}
              className="checkbox" />
            <span className="label-text ml-3">{key}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 my-5 gap-4"> <label className="form-control w-full">
<div className="label">
<span className="label-text">Product Name</span> </div>
<input type="text" placeholder="Type here" className="input input-bordered w-full"/>
        onKeyUp={(e)=> setProductName(e.target.value)}
 </label>
 <div className='flex justtify-end my-5'> 
        <button className='btn btn-outline' onClick={()=>{getData(); setPageNo(1)}}>Serch</button>
 </div>
  </div>

      <div className="overflow-x-auto">

        <table className="table ml-1 mt-10">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                {keys.map((key) => (
                  <td key={key}>{item[key]}</td>
                ))}
              </tr>
            ))}



          </tbody>
        </table>
      </div>
    </>
  );
}

export default SuperStorePage;
