const Api_URL = "http://localhost:8080/auth/login"; // este sirve para hacer la peticion y recibir el token

export async function login(email, password){
const response = await fetch (Api_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({email, password})
});
   if (!response.ok){
    throw new Error("Error en login");
   }
   return response.json(); 
}