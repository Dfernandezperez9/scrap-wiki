const AXIOS = require('axios');
const CHEERIO = require('cheerio');
const EXPRESS = require('express');
const APP = EXPRESS();

const URL = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';
const URL2 = 'https://es.wikipedia.org';

let TITULO_PRINCIPAL = [];
let TODOS_ENLACES = [];

APP.get('/', (req, res) => {
    AXIOS.get(URL).then(response => {
        const $ = CHEERIO.load(response.data);
  
        $('h1').each((index, element) => {
        TITULO_PRINCIPAL.push($(element).text());
        });
  
        const PROMESAS = [];
        $('#mw-content-text .mw-category-generated #mw-pages a').each((index, element) => {
            const LINKS = $(element).attr('href');
            TODOS_ENLACES.push(LINKS);
  
            PROMESAS.push(
            AXIOS.get(`${URL2}${LINKS}`)
            .then(response => {
                const HTML = response.data;
                const $ = CHEERIO.load(HTML);

                const TITULOS = $('h1');
                const TITULO = TITULOS.text();
  
                const IMAGENES = $('.mw-file-description img');
                const IMAGEN = IMAGENES.attr('src');
  
                const PARRAFOS = $('p');
                const TEXTO = PARRAFOS.text();
  
                const OBJETO = {
                    nombre: TITULO,
                    enlace: `${URL2}${LINKS}`,
                    imagen: IMAGEN,
                    informacion: TEXTO,
                };
  
                return OBJETO;
            })
            .catch(error => {
                console.error(error);
            }));
        });
  
        Promise.all(PROMESAS).then(objetos => {
            res.send(objetos);


            // RESPUESTA VISUAL
            // (Varios artistas no disponen de imagen y otros no permiten el acceso a su imagen mediante "libro naranja(?)")

            /*
            res.send(`
            <h1>${TITULO_PRINCIPAL}</h1>
            <br>
            ${objetos.map(objeto => `
            <h2><a href="${objeto.enlace}">${objeto.enlace.split("/")[4]}</a></h2>
            <img src="${objeto.imagen}"/>
            <p>${objeto.informacion}</p>
            <br>
            `).join('')}
            `);*/
        });
    })
    .catch(error => {
        console.error(error);
    });
});
   
APP.listen(3000, () => {
console.log('Servidor escuchando en el puerto 3000');
});