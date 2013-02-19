/* 
 @victorvhpg
 https://github.com/victorvhpg/efeitoPixel/blob/master/efeitoPixel.js
 19/02/2013
 */
!function(w) {
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
    var configurarPadrao = function(configPadrao, configEnviada) {
        var retorno = {};
        configEnviada = configEnviada || {};
        for (var c in configPadrao) {
            retorno[c] = configEnviada[c] || configPadrao[c];
        }
        return retorno;
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
        pixel: function(ctx, objetoImageData, larguraPixel, alturaPixel, opacidade) {
            var larguraTotal, alturaTotal, totalLinhas, totalColunas, pixels,
                    metadeLarguraPixel, metadeAlturaPixel, l,
                    y, py, c, x, r, g, b, indicePixelMeio;
            larguraTotal = objetoImageData.width;
            alturaTotal = objetoImageData.height;
            totalLinhas = alturaTotal / alturaPixel;
            totalColunas = larguraTotal / larguraPixel;
            metadeLarguraPixel = Math.max(larguraPixel / 2, 1);
            metadeAlturaPixel = Math.max(alturaPixel / 2, 1);
            pixels = objetoImageData.data;
            for (l = 0; l < totalLinhas; l++) {
                y = (l * alturaPixel);
                py = ((Math.floor(y + metadeAlturaPixel)) * larguraTotal * 4);
                for (c = 0; c < totalColunas; c++) {
                    x = (c * larguraPixel);
                    indicePixelMeio = py + (((Math.min(Math.floor(x + metadeLarguraPixel), (larguraTotal - 1))) * 4));
                    r = pixels[indicePixelMeio];
                    g = pixels[indicePixelMeio + 1];
                    b = pixels[indicePixelMeio + 2];
                    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," +
                            ((opacidade === -1) ? (pixels[indicePixelMeio + 3] / 255) : opacidade) + ")";
                    ctx.fillRect(x, y, larguraPixel, alturaPixel);
                }
            }
        }
    };

    efeitoPixel.prototype = {
        constructor: efeitoPixel,
        inverteCor: function(config) {
            config = configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal
            }, config);
            //atualiza o array de pixels
            efeitoPixel.realizaEfeito.inverteCor(config.objetoImageData);
            this.ctx.putImageData(config.objetoImageData, 0, 0);
        },
        pixel: function(config) {
            config = configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal,
                larguraPixel: 10,
                alturaPixel: 10,
                opacidade: -1
            }, config);
            efeitoPixel.realizaEfeito.pixel(this.ctx, config.objetoImageData, config.larguraPixel, config.alturaPixel, config.opacidade);
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



