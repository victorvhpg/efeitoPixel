/* 
 @victorvhpg
 https://github.com/victorvhpg/efeitoPixel/blob/master/efeitoPixel.js
 19/02/2013
 */
!function(w) {
    "use strict";
    var _configurarPadrao = function(configPadrao, configEnviada) {
        var retorno = {};
        configEnviada = configEnviada || {};
        for (var c in configPadrao) {
            retorno[c] = configEnviada[c] || configPadrao[c];
        }
        return retorno;
    };
    var efeitoPixel = function() {
        this.media = null;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.objetoImageDataGlobal = null;
        this.pararVideo = false;
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
        pixel: function(ctx, xInit, yInit, objetoImageData, larguraPixel, alturaPixel, opacidade, marginX, marginY) {
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
                    ctx.fillRect(xInit + x, yInit + y, larguraSemMargin, alturaSemMargin);
                }
            }
        }
    };

    efeitoPixel.prototype = {
        constructor: efeitoPixel,
        inverteCor: function(configGlobal, config) {
            config = _configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal
            }, config);
            //atualiza o array de pixels
            efeitoPixel.realizaEfeito.inverteCor(config.objetoImageData);
            this.ctx.putImageData(config.objetoImageData, 0, 0);
        },
        pixel: function(configGlobal, config) {
            config = _configurarPadrao({
                objetoImageData: this.objetoImageDataGlobal,
                larguraPixel: 10,
                alturaPixel: 10,
                opacidade: -1,
                marginX: 0,
                marginY: 0
            }, config);
            efeitoPixel.realizaEfeito.pixel(this.ctx, configGlobal.x, configGlobal.y,
                    config.objetoImageData, config.larguraPixel, config.alturaPixel,
                    config.opacidade, config.marginX, config.marginY);

        },
        processa: function(config) {
            var l = this.media.width;
            var a = this.media.height;
            try {
                this.ctx.drawImage(this.media, 0, 0, l, a);
            } catch (e) {
                //problemas com video no firefox nightly 22.0a1
                // NS_ERROR_NOT_AVAILABLE: Component is not available 
                console.error(e);
                return;
            }
            config.larguraTotal = ((config.x + config.larguraTotal) > l) ? (l - config.x) : config.larguraTotal;
            config.alturaTotal = ((config.y + config.alturaTotal) > a) ? (a - config.y) : config.alturaTotal;
            this.objetoImageDataGlobal = this.ctx.getImageData(config.x, config.y,
                    config.larguraTotal, config.alturaTotal);
            this.ctx.clearRect(config.x, config.y,
                    config.larguraTotal, config.alturaTotal);
            for (var i = 0; i < config.efeitos.length; i++) {
                this[config.efeitos[i].tipo](config, config.efeitos[i].config);
            }
        },
        pararExecVideo: function() {
            this.pararVideo = true;
        },
        init: function(config) {
            var that = this;
            this.media = (config.media.nodeName === "VIDEO") ? document.createElement("video") : new Image();
            this.media.src = config.media.src;
            document.body.appendChild(this.media);
            config.media.parentNode.replaceChild(this.canvas, config.media);
            var init = function(callback) {
                var css = w.getComputedStyle(that.media, null);
                var l = parseFloat(css.getPropertyValue("width"));
                var a = parseFloat(css.getPropertyValue("height"));
                that.media.width = l;
                that.media.height = a;
                config = _configurarPadrao({
                    x: 0,
                    y: 0,
                    larguraTotal: l,
                    alturaTotal: a,
                    efeitos: []
                }, config);
                that.canvas.width = l;// this.width;
                that.canvas.height = a;//this.height;
                that.processa(config);
                that.media.style.display = "none";
                if (typeof callback === "function") {
                    callback(config);
                }
            };
            (config.media.nodeName === "VIDEO") ? function() {
                //loadedmetadata/canplaythrough
                that.media.addEventListener("playing", function() {
                    //problemas no load firefox nightly 
                    // setTimeout(function() {
                    init(function(c) {
                        var loop = function() {
                            w.requestAnimationFrame(function() {
                                if (!that.pararVideo) {
                                    that.processa(c);
                                    loop();
                                }
                            });
                        };
                        loop();
                    });
                    //  }, 1000);

                }, false);
                that.media.play();
            }() : this.media.addEventListener("load", init, false);
            return this;
        }
    };
    w.efeitoPixel = efeitoPixel;
}(window);



