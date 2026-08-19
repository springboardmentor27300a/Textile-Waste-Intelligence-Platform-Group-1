// import apiClient from "../api/apiClient";


// export async function createWasteBatch(data) {
//   const response = await apiClient.post(
//     "/waste-batches",
//     data
//   );

//   return response.data;
// }


// export async function getWasteBatches(params = {}) {
//   const response = await apiClient.get(
//     "/waste-batches",
//     { params }
//   );

//   return response.data;
// }


// export async function getWasteBatch(batchId) {
//   const response = await apiClient.get(
//     `/waste-batches/${batchId}`
//   );

//   return response.data;
// }


// export async function updateWasteBatch(
//   batchId,
//   data
// ) {
//   const response = await apiClient.patch(
//     `/waste-batches/${batchId}`,
//     data
//   );

//   return response.data;
// }


// export async function updateWasteBatchStatus(
//   batchId,
//   status,
//   remarks = null
// ) {
//   const response = await apiClient.patch(
//     `/waste-batches/${batchId}/status`,
//     {
//       status,
//       remarks,
//     }
//   );

//   return response.data;
// }


// export async function getWasteBatchStatusHistory(
//   batchId
// ) {
//   const response = await apiClient.get(
//     `/waste-batches/${batchId}/status-history`
//   );

//   return response.data;
// }


// export async function uploadWasteImage(
//   batchId,
//   file,
//   isPrimary = false
// ) {
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append(
//     "is_primary",
//     String(isPrimary)
//   );

//   const response = await apiClient.post(
//     `/waste-batches/${batchId}/images`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   return response.data;
// }


// export async function getWasteImages(batchId) {
//   const response = await apiClient.get(
//     `/waste-batches/${batchId}/images`
//   );

//   return response.data;
// }

// export async function analyzeBatch(batchId) {
//   const response = await apiClient.post(`/analysis/${batchId}`);
//   return response.data;
// }


import apiClient from "../api/apiClient";


export async function createWasteBatch(data) {
  const response = await apiClient.post(
    "/waste-batches",
    data
  );

  return response.data;
}


export async function getWasteBatches(params = {}) {
  const response = await apiClient.get(
    "/waste-batches",
    { params }
  );

  return response.data;
}


export async function getWasteBatch(batchId) {
  const response = await apiClient.get(
    `/waste-batches/${batchId}`
  );

  return response.data;
}


export async function updateWasteBatch(
  batchId,
  data
) {
  const response = await apiClient.patch(
    `/waste-batches/${batchId}`,
    data
  );

  return response.data;
}


export async function updateWasteBatchStatus(
  batchId,
  status,
  remarks = null
) {
  const response = await apiClient.patch(
    `/waste-batches/${batchId}/status`,
    {
      status,
      remarks,
    }
  );

  return response.data;
}


export async function getWasteBatchStatusHistory(
  batchId
) {
  const response = await apiClient.get(
    `/waste-batches/${batchId}/status-history`
  );

  return response.data;
}


export async function uploadWasteImage(
  batchId,
  file,
  isPrimary = false
) {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "is_primary",
    String(isPrimary)
  );

  const response = await apiClient.post(
    `/waste-batches/${batchId}/images`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}


export async function getWasteImages(
  batchId
) {
  const response = await apiClient.get(
    `/waste-batches/${batchId}/images`
  );

  return response.data;
}


export async function analyzeBatch(
  batchId
) {
  const response = await apiClient.post(
    `/analysis/${batchId}`
  );

  return response.data;
}