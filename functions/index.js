const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

exports.enviarWhatsApp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    const telefono = req.body.telefono;
    const mensaje = req.body.mensaje;

    console.log("Telefono:", telefono);
    console.log("Mensaje:", mensaje);

    const phoneNumberId = "996052293598272";

    const accessToken = "EAAhJTuhZBjOQBQ02WMJWqZCmXjiGZBZAFZADeQev28djLPqyDD9CYE1bZA1sx6haFrU3gZARWgZAPTXSmMSi3D3AF4mfu6cIutxSgHegEG6UjZCIT1dBnbyh3XnabN4rMTkUVw1ZBO1JArHwjEhnZBjtisZCc4bp1I8NnJU615VJVUk8TiN8UVfVtgc1gUjAZCoe9o8r93t2VJ3pKLOUcduATq1jFlfi4HAnVaNt7yY8yZANSd2W2mVsFC4Um17cBeuuFLphgTkpazWMk8171mUcn5WHdo";

    try {

      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: "5491131952430",
          type: "text",
          text: {
            body: mensaje
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Respuesta WhatsApp API:", response.data);

      res.status(200).send({
        success: true,
        data: response.data
      });

    } catch (error) {

      console.error("ERROR WHATSAPP:", error.response?.data || error.message);

      res.status(500).send({
        success: false,
        error: error.response?.data || error.message
      });

    }

  });
});