/* 
 @victorvhpg
 https://github.com/victorvhpg/efeitoPixel/blob/master/efeitoPixel.js
 19/02/2013
 */
!function(w) {
    var _configurarPadrao = function(configPadrao, configEnviada) {
        var retorno = {};
        configEnviada = configEnviada || {};
        for (var c in configPadrao) {
            retorno[c] = configEnviada[c] || configPadrao[c];
        }
        return retorno;
    };
    var efeitoPixel = function() {
        this.img = new Image();
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.objetoImageDataGlobal = null;
        this.versao = "0.1";
    };
    efeitoPixel.init = function(config) {
        return (new efeitoPixel()).init(config);
    };
    efeitoPixel.efeitos = {
        inverteCor: "inverteCor",
        pixel: "pixel"
    };
    efeitoPixel.utils = {
        getMediaRGB: function(pixels, xInit, yInit, largura,
                altura, larguraTotal, alturaTotal) {
            var posPixel, r = 0, g = 0, b = 0, lt, at, total;
            at = Math.min(altura + yInit, alturaTotal);
            lt = Math.min((largura + xInit), larguraTotal);
            total = (at - yInit) * (lt - xInit);
            for (var i = yInit; i < at; i++) {
                for (var j = xInit; j < lt; j++) {
                    posPixel = (j + (i * larguraTotal)) * 4;
                    r += pixels[posPixel];
                    g += pixels[posPixel + 1];
                    b += pixels[posPixel + 2];
                }
            }
            return {
                r: Math.floor(r / total),
                g: Math.floor(g / total),
                b: Math.floor(b / total)
            };
        }
    };
    efeitoPixel.realizaEfeito = {
        inverteCor: function(objetoImageData) {
            var y, x, posPixel;
            var larguraTotal = objetoImageData.width;
            var alturaTotal = objetoImageData.height;
            var vetPixel = objetoImageData.data;
            for (y = 0; y < alturaTotal; y++) {
                for (x = 0; x < larguraTotal; x++) {
                    posPixel = (y * larguraTotal + x) * 4;
                    vetPixel[posPixel] = 255 - vetPixel[posPixel];
                    vetPixel[posPixel + 1] = 255 - vetPixel[posPixel + 1];
                    vetPixel[posPixel + 2] = 255 - vetPixel[posPixel + 2];
                }
            }
        },
        pixel: function(ctx, objetoImageData, larguraPixel, alturaPixel, opacidade, marginX, marginY) {
            var larguraTotal, alturaTotal, totalLinhas, totalColunas, pixels,
                    metadeLarguraPixel, metadeAlturaPixel, l, mediaRGB,
                    y, py, c, x, r, g, b, indicePixelMeio, larguraSemMargin, alturaSemMargin, getMediaRGB;
            larguraSemMargin = larguraPixel;
            alturaSemMargin = alturaPixel;
            larguraPixel += marginX;
            alturaPixel += marginY;
            larguraTotal = objetoImageData.width;
            alturaTotal = objetoImageData.height;
            totalLinhas = alturaTotal / alturaPixel;
            totalColunas = larguraTotal / larguraPixel;
            getMediaRGB = efeitoPixel.utils.getMediaRGB;
            // metadeLarguraPixel = Math.max(larguraPixel / 2, 1);
            //  metadeAlturaPixel = Math.max(alturaPixel / 2, 1);
            pixels = objetoImageData.data;
            for (l = 0; l < totalLinhas; l++) {
                y = (l * alturaPixel);
                //py = ((Math.floor(y + metadeAlturaPixel)) * larguraTotal * 4);
                for (c = 0; c < totalColunas; c++) {
                    x = (c * larguraPixel);
                    // indicePixelMeio = py + (((Math.min(Math.floor(x + metadeLarguraPixel), (larguraTotal - 1))) * 4));                    
                    mediaRGB = getMediaRGB(pixels, x, y, larguraPixel, alturaPixel, larguraTotal, alturaTotal);
                    r = mediaRGB.r;//pixels[indicePixelMeio];
                    g = mediaRGB.g;// pixels[indicePixelMeio + 1];
                    b = mediaRGB.b;//pixels[indicePixelMeio + 2];
                    ctx.fillStyle = "rgba(" + (r) + "," + (g) + "," + (b) + "," +
                            ((opacidade === -1) ? (pixels[indicePixelMeio + 3] / 255) : opacidade) + ")";
                    ctx.fillRect(x, y, larguraSemMargin, alturaSemMargin);
                }
            }
        }
    };

    efeitoPixel.prototype = {
        constructor: efeitoPixel,
        inverteCor: function(config) {
            config = _configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal
            }, config);
            //atualiza o array de pixels
            efeitoPixel.realizaEfeito.inverteCor(config.objetoImageData);
            this.ctx.putImageData(config.objetoImageData, 0, 0);
        },
        pixel: function(config) {
            config = _configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal,
                larguraPixel: 10,
                alturaPixel: 10,
                opacidade: -1,
                marginX: 0,
                marginY: 0
            }, config);
            efeitoPixel.realizaEfeito.pixel(this.ctx, config.objetoImageData, config.larguraPixel, config.alturaPixel, config.opacidade, config.marginX, config.marginY);

        },
        init: function(config) {
            var that = this;
            this.img.src = config.img.src;
            config.img.parentNode.replaceChild(this.canvas, config.img);
            this.img.addEventListener("load", function() {
                that.canvas.width = this.width;
                that.canvas.height = this.height;
                that.ctx.drawImage(this, 0, 0);
                that.objetoImageDataGlobal = that.ctx.getImageData(0, 0, that.canvas.width, that.canvas.height);
                that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
                for (var i = 0; i < config.efeitos.length; i++) {
                    that[config.efeitos[i].tipo](config.efeitos[i].config);
                }
            }, false);

        }
    };
    w.efeitoPixel = efeitoPixel;
}(window);



