import * as cheerio from 'cheerio';
import fs from "fs"

const url = "https://www.futebolaovivobrasil.com/"

const scraper = async () => {
    const response = await fetch(url)
    if (!response.ok) {
        console.log("Erro na requisição, status: " + response.status)
        return
    }

    const html = await response.text()

    const $ = cheerio.load(html)

    const tabelaPrincipal = $(".tablaPrincipal").first()

    const linhasTr = tabelaPrincipal.find("tr");

    const jogos_de_hoje = []

    let campeonatoAtual = ""

    linhasTr.each((index, tr) => {
        const el = $(tr)

        // 1️⃣ Cabeçalho
        if (el.attr("class") === "cabeceraCompericion") {
            campeonatoAtual = el.find(".internalLink").text().trim()
            return
        }

        // 2️⃣ Linha de jogo
        const partida_de_futebol = {
            campeonato: campeonatoAtual,
            hora: "",
            time_casa: {
                nome: "",
                img: ""
            },
            time_visitante: {
                nome: "",
                img: ""
            },
            canais: []
        }

        partida_de_futebol.hora =
            el.find(".hora").text().trim()

        partida_de_futebol.time_casa.nome =
            el.find(".local .internalLink").text().trim()

        partida_de_futebol.time_casa.img =
            el.find(".local img").attr("src") || ""


        partida_de_futebol.time_visitante.nome =
            el.find(".visitante .internalLink").text().trim()

        partida_de_futebol.time_visitante.img =
            el.find(".visitante img").attr("src") || ""

        el.find(".listaCanales li").each((indice, item) => {
            const canal = $(item)
            partida_de_futebol.canais.push(canal.text())
        })

        // 👉 quando terminar de montar
        jogos_de_hoje.push(partida_de_futebol)
    })

    const jogos_de_hoje_filter = jogos_de_hoje.filter((jogo) => {
        return jogo.canais.length > 0
    })

    const json = JSON.stringify(jogos_de_hoje_filter, null, 2);

    fs.writeFile("jogos.json", json, "utf-8", (err) => {
        if (err) {
            console.error("Erro ao salvar o arquivo:", err);
            return;
        }

        console.log("Arquivo jogos.json criado com sucesso!");
    });
}

scraper()
