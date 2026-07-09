import "./style.css";
import moonIcon from "./assets/moon.svg";
import sunIcon from "./assets/sun.svg";
import { searchWeather } from "./services/openMeteo";
import { getWeatherCodeDescription } from "./utils/weatherCode";
import { toWindCardinal } from "./utils/windDirection";

const app = document.querySelector<HTMLDivElement>("#app");

type UiState = "empty" | "loading" | "result";

if (app) {
   app.innerHTML = `
      <main class="weather-app" aria-label="Aplicação de clima">
         <section class="search-area" aria-label="Busca de cidade">
            <form id="search-form" class="search-form" role="search">
               <label for="city-input">Cidade</label>
               <input id="city-input" name="city" type="search" placeholder="Digite o nome da cidade" />
               <button id="search-button" type="submit">Buscar</button>
            </form>
         </section>

         <section id="empty-state" class="state-panel" aria-live="polite">
            <p>Pesquise uma cidade para ver o clima</p>
         </section>

         <section id="loading-state" class="state-panel" aria-live="polite" hidden>
            <div class="loading-indicator" role="status" aria-label="Carregando"></div>
            <p>Carregando dados do clima...</p>
         </section>

         <section id="weather-card" class="weather-card" aria-label="Dados meteorológicos" hidden>
            <aside id="weather-sidebar" class="weather-sidebar" aria-label="Resumo do clima">
               <div id="sidebar-temperature"></div>
               <div id="sidebar-location"></div>
               <div id="sidebar-date"></div>
               <div id="sidebar-day-night"></div>
               <div id="sidebar-condition"></div>
            </aside>

            <section id="weather-main" class="weather-main" aria-label="Métricas detalhadas">
               <div id="metric-humidity"></div>
               <div id="metric-feels-like"></div>
               <div id="metric-precipitation"></div>
               <div id="metric-wind"></div>
            </section>
         </section>
      </main>
   `;

   const searchForm = document.querySelector<HTMLFormElement>("#search-form");
   const cityInput = document.querySelector<HTMLInputElement>("#city-input");
   const searchButton = document.querySelector<HTMLButtonElement>("#search-button");
   const emptyState = document.querySelector<HTMLElement>("#empty-state");
   const loadingState = document.querySelector<HTMLElement>("#loading-state");
   const weatherCard = document.querySelector<HTMLElement>("#weather-card");
   const sidebarTemperature = document.querySelector<HTMLElement>("#sidebar-temperature");
   const sidebarLocation = document.querySelector<HTMLElement>("#sidebar-location");
   const sidebarDate = document.querySelector<HTMLElement>("#sidebar-date");
   const sidebarDayNight = document.querySelector<HTMLElement>("#sidebar-day-night");
   const sidebarCondition = document.querySelector<HTMLElement>("#sidebar-condition");
   const metricHumidity = document.querySelector<HTMLElement>("#metric-humidity");
   const metricFeelsLike = document.querySelector<HTMLElement>("#metric-feels-like");
   const metricPrecipitation = document.querySelector<HTMLElement>("#metric-precipitation");
   const metricWind = document.querySelector<HTMLElement>("#metric-wind");

   const setSearchAvailability = (isEnabled: boolean): void => {
      if (cityInput) {
         cityInput.disabled = !isEnabled;
      }

      if (searchButton) {
         searchButton.disabled = !isEnabled;
      }
   };

   const renderState = (state: UiState): void => {
      if (!emptyState || !loadingState || !weatherCard) {
         return;
      }

      emptyState.hidden = state !== "empty";
      loadingState.hidden = state !== "loading";
      weatherCard.hidden = state !== "result";
   };

   const setMetric = (container: HTMLElement | null, label: string, value: string): void => {
      if (!container) {
         return;
      }

      container.innerHTML = `<span class="metric-label">${label}</span><span class="metric-value">${value}</span>`;
   };

   const handleSearch = async (): Promise<void> => {
      if (!cityInput) {
         return;
      }

      const cityName = cityInput.value.trim();

      if (!cityName) {
         return;
      }

      cityInput.value = cityName;
      renderState("loading");
      setSearchAvailability(false);

      try {
         const weatherData = await searchWeather(cityName);

         if (!weatherData) {
            renderState("empty");
            return;
         }

         const { current, current_units } = weatherData;

         if (sidebarTemperature) {
            sidebarTemperature.textContent = `${current.temperature_2m}${current_units.temperature_2m}`;
         }

         if (sidebarLocation) {
            sidebarLocation.textContent = `${weatherData.name}, ${weatherData.country_code}`;
         }

         if (sidebarDate) {
            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
               weekday: "long",
               day: "numeric",
               month: "long",
               year: "numeric",
               timeZone: weatherData.timezone,
            }).format(new Date());

            sidebarDate.textContent = formattedDate;
         }

         if (sidebarDayNight) {
            const label = current.is_day === 1 ? "Dia" : "Noite";
            const icon = current.is_day === 1 ? sunIcon : moonIcon;
            sidebarDayNight.innerHTML = `<img src="${icon}" alt="${label}" class="day-night-icon" /><span>${label}</span>`;
         }

         if (sidebarCondition) {
            sidebarCondition.textContent = getWeatherCodeDescription(current.weather_code);
         }

         setMetric(
            metricHumidity,
            "Umidade",
            `${current.relative_humidity_2m}${current_units.relative_humidity_2m}`
         );
         setMetric(
            metricFeelsLike,
            "Sensação térmica",
            `${current.apparent_temperature}${current_units.apparent_temperature}`
         );
         setMetric(
            metricPrecipitation,
            "Precipitação",
            `${current.precipitation_probability}${current_units.precipitation_probability}`
         );

         const windCardinal = toWindCardinal(current.wind_direction_10m);
         const windValue = `${current.wind_speed_10m} ${current_units.wind_speed_10m} · ${current.wind_direction_10m}${current_units.wind_direction_10m} (${windCardinal})`;
         setMetric(metricWind, "Vento", windValue);

         renderState("result");
      } finally {
         setSearchAvailability(true);
      }
   };

   renderState("empty");

   searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      void handleSearch();
   });

   cityInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
         return;
      }

      event.preventDefault();
      void handleSearch();
   });
}
