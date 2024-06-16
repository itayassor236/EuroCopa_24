// AnyComponent.js

import React, { useEffect, useState } from 'react';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AnyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/your-endpoint`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      {/* Render your data here */}
    </div>
  );
};

export default AnyComponent;
