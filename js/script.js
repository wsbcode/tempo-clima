//==========================================
// Script para o aplicativo de clima e tempo
//==========================================

// Aguarda o carregamento completo do DOM antes de executar
$(document).ready(function () {
   // Log no console indicando que a aplicação foi iniciada com sucesso
   console.log("%c [1] Aplicativo de clima e tempo iniciado.", "color: green; font-weight: bold;");
});

// Função para buscar dados do clima (Bloco principal OTIMIZADO)
$("#buscar").on("click", function () {
   console.log("%c [2] Botão de busca clicado.", "color: blue; font-weight: bold;");
   console.log("%c [3] Iniciando busca de dados do clima...", "color: orange; font-weight: bold;");

   let cidade = $("#cidade").val();
   console.log("%c [4] Cidade inserida: " + cidade, "color: purple; font-weight: bold;");

   // [5] Verificação de cidade vazia
   if (cidade === "") {
      console.warn(
         "%c [5] Nenhuma cidade inserida. Exibindo mensagem de erro.",
         "color: red; font-weight: bold;"
      );
      $("#resultado").html("<p style='color: red;'>Por favor, insira o nome de uma cidade.</p>");
      return;
   }

   // Seu API Key
   let apiKey = "d1659feb6814596038bab304b82d857f";
   let url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`;
   console.log("%c [6] URL da API construída: " + url, "color: teal; font-weight: bold;");

   // Requisição à API com tratamento de SUCESSO e FALHA
   $.getJSON(url, function (data) {
      console.log("%c [7] Dados recebidos da API:", "color: green; font-weight: bold;", data);

      let nome = data.name;
      let temp = Math.round(data.main.temp);
      let desc = data.weather[0].description;
      let clima = data.weather[0].main.toLowerCase();

      // Informações adicionais necessárias para a lógica Dia/Noite
      const horaAtual = data.dt;
      const porDoSol = data.sys.sunset;
      const nascerDoSol = data.sys.sunrise;

      console.log({ nome, temp, desc, clima, horaAtual, porDoSol, nascerDoSol });

      // --- LÓGICA DE ÍCONES (COM CORREÇÃO DIA/NOITE) ---
      let icone = "images/padrao.png";

      if (clima.includes("rain") || desc.includes("chuva")) {
         icone = "images/rain.png";
      } else if (clima.includes("cloud") || desc.includes("nublado")) {
         icone = "images/cloudy.png";
      } else if (clima.includes("thunder") || desc.includes("tempestade")) {
         icone = "images/storm.png";
      } else if (clima.includes("mist") || desc.includes("neblina")) {
         icone = "images/fog.png";
      }
      // Verifica se é céu limpo (`clear`) E aplica ícone de Sol ou Noite
      else if (clima.includes("clear") || desc.includes("sun")) {
         // Se a hora atual for APÓS o pôr do sol OU ANTES do nascer do sol, é noite.
         if (horaAtual > porDoSol || horaAtual < nascerDoSol) {
            icone = "images/night.png";
         } else {
            icone = "images/sun.png"; // Se não, é dia
         }
      }

      // --- EXIBIÇÃO DO RESULTADO ---
      let resultadoHTML = "";
      resultadoHTML += `<h2>Clima em ${nome}</h2>`;
      resultadoHTML += `<img src="${icone}" alt="Ícone do clima">`;
      resultadoHTML += `<p>Temperatura: ${temp} °C</p>`;
      resultadoHTML += `<p>Descrição: ${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>`;
      resultadoHTML += `<p>Umidade: ${data.main.humidity}%</p>`;
      resultadoHTML += `<p>Vento: ${data.wind.speed} m/s</p>`;

      $("#resultado").html(resultadoHTML);
      console.log("%c [8] Resultado exibido na página.", "color: green; font-weight: bold;");

      // --- LÓGICA DO FUNDO (COM CORREÇÃO DIA/NOITE) ---
      let fundo = "linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)";

      if (clima.includes("rain") || desc.includes("chuva")) {
         fundo = "linear-gradient(to right, #000046, #1cb5e0)";
      } else if (clima.includes("cloud") || desc.includes("nublado")) {
         fundo = "linear-gradient(to right, #757f9a, #d7dde8)";
      } else if (clima.includes("thunder") || desc.includes("tempestade")) {
         fundo = "linear-gradient(to right, #373b44, #4286f4)";
      } else if (clima.includes("mist") || desc.includes("neblina")) {
         fundo = "linear-gradient(to right, #3e5151, #decba4)";
      }
      // Se for céu limpo (`clear`), verifica se é dia ou noite
      else if (clima.includes("clear") || desc.includes("sun")) {
         if (horaAtual > porDoSol || horaAtual < nascerDoSol) {
            fundo = "linear-gradient(to right, #232526, #414345)"; // Noite
         } else {
            fundo = "linear-gradient(to right, #f7971e, #ffd200)"; // Dia (Sol)
         }
      }
      // Se for qualquer outra condição (padrão)
      else {
         fundo = "linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)";
      }

      $("body").css("backgroundImage", fundo);
   })
      // TRATAMENTO DE ERRO (Quando a cidade não é encontrada, status 404)
      .fail(function (jxhr, textStatus, error) {
         console.error(
            "%c [ERRO API] Falha na busca: " + textStatus + ", " + error,
            "color: red; font-weight: bold;"
         );

         let mensagemErro =
            "Não foi possível encontrar a cidade. Verifique a ortografia ou tente incluir o código do país (ex: 'Recife,br').";
         $("#resultado").html(`<p style='color: red;'>${mensagemErro}</p>`);
         $("body").css("backgroundImage", "linear-gradient(to right, #cc2b5e, #753a88)"); // Fundo de erro
      });
});
