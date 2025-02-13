// import React from "react";
// import { Navigate } from "react-router-dom";
// import { decryptData } from "../../../components/utils/encrypt";

// const RoleCheck = (WrappedComponent, allowedRoles) => {
//   return (props) => {
//         const encryptedData = localStorage.getItem('D!');
//     const decryptedData = decryptData(encryptedData);
//     const { role: roleid } = decryptedData;

//     if (allowedRoles.includes(parseInt(roleid))) {
//       return <WrappedComponent {...props} />;
//     } else {
//       return <Navigate to="*" />;
//     }
//   };
// };

// export default RoleCheck;
