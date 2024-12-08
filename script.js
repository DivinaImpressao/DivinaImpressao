$(document).ready(function () {
  const gallery = $("#gallery");
  const itemsPerPageSelect = $("#items-per-page");
  const paginationControls = $("#pagination-controls");
  let currentPage = 1;
  let itemsPerLoad = 10;
  let allData = [];
  // Variável de controle para evitar múltiplos carregamentos simultâneos
  let isLoading = false;

  // Fetch data from JSON
  $.getJSON("pecas.json", function (data) {
    allData = data;
    setupPagination(allData); // Inicializar paginação
    renderGallery(allData.slice(0, itemsPerLoad)); // Renderizar primeira página
  });

  // Paginação dinâmica
  function setupPagination(data) {
    paginationControls.empty();

    if (itemsPerLoad === Infinity) {
      // Lazy Loading (remover paginação para modo infinito)
      $(window).on("scroll", handleLazyLoading);
    } else {
      // Paginação Clássica
      $(window).off("scroll"); // Desativar lazy loading
      const totalPages = Math.ceil(data.length / itemsPerLoad);
      for (let i = 1; i <= totalPages; i++) {
        paginationControls.append(`
                    <button class="btn btn-outline-secondary mx-1" data-page="${i}">${i}</button>
                `);
      }
      // Troca de página
      paginationControls.on("click", "button", function () {
        currentPage = $(this).data("page");
        const start = (currentPage - 1) * itemsPerLoad;
        const end = start + itemsPerLoad;
        renderGallery(data.slice(start, end));
      });
    }
  }

  // Renderizar galeria
  function renderGallery(data, clear = true) {
    if (clear) {
      gallery.empty(); // Limpa a galeria se solicitado
    }

    // Verifica se há dados a renderizar
    if (data.length === 0) {
      gallery.append('<p class="text-center">Nenhum item encontrado.</p>');
      return;
    }

    // Renderiza cada item
    data.forEach((item) => {
      let carouselId = `carousel-${item.id}`;
      let carouselImages = item.images
        .map(
          (img, index) => `
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <img src="${img}" class="d-block w-100" alt="${item.name}">
            </div>
        `
        )
        .join("");

      // Dentro do forEach do renderGallery()
      gallery.append(`
      <div class="col-md-4">
        <div class="card">
          <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${carouselImages}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Próxima</span>
            </button>
          </div>
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="description">${item.description}</p>
            <p class="tags">${item.tags.join(", ")}</p>
            <button class="neo-btn more-details" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#itemModal">Mais detalhes</button>
          </div>
        </div>
      </div>
    `);
    });
    ajustarAlturaDosCards();
  }
  gallery.on("click", ".more-details", function () {
    const itemId = $(this).data("id");
    const selectedItem = allData.find((i) => i.id === itemId);

    $("#modalItemName").text(selectedItem.name);
    $("#modalItemDescription").text(selectedItem.description);
    $("#modalItemTags").text(selectedItem.tags.join(", "));

    // Criar o HTML do carrossel:
    // Vamos assumir que selectedItem.images é um array como ["img1.jpg", "img2.jpg", ...]

    if (selectedItem.images && selectedItem.images.length > 0) {
      let carouselId = `modal-carousel-${selectedItem.id}`;
      let carouselIndicators = "";
      let carouselInner = "";

      selectedItem.images.forEach((img, index) => {
        carouselIndicators += `
          <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
            class="${index === 0 ? "active" : ""}" aria-current="${index === 0 ? "true" : "false"}" 
            aria-label="Slide ${index + 1}"></button>
        `;

        carouselInner += `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${img}" class="d-block w-100" alt="Imagem ${index + 1} de ${selectedItem.name}">
          </div>
        `;
      });

      let carouselHTML = `
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-indicators">
            ${carouselIndicators}
          </div>
          <div class="carousel-inner">
            ${carouselInner}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Próxima</span>
          </button>
        </div>
      `;

      $("#modalItemImages").html(carouselHTML);
    } else {
      // Caso não tenha imagens, pode exibir uma mensagem alternativa
      $("#modalItemImages").html("<p>Nenhuma imagem disponível.</p>");
    }
  });

  function handleLazyLoading() {
    const scrollHeight = $(document).height();
    const scrollPosition = $(window).height() + $(window).scrollTop();

    // Verifica se o usuário está próximo do fim da página
    if (scrollPosition >= scrollHeight - 100 && !isLoading) {
      isLoading = true; // Evita múltiplas chamadas
      updateGallery("infinite");
      isLoading = false; // Libera para a próxima execução
    }
  }

  // Alterar itens por página
  itemsPerPageSelect.on("change", function () {
    const value = $(this).val();
    itemsPerLoad = value === "infinite" ? 20 : parseInt(value);
    currentPage = 1; // Resetar para a primeira página

    if (value === "infinite") {
      $(window).on("scroll", handleLazyLoading);
      gallery.empty(); // Limpa a galeria para reiniciar o scroll infinito
      updateGallery("infinite"); // Inicia o scroll infinito
    } else {
      $(window).off("scroll"); // Desativa o scroll infinito
      gallery.empty(); // Limpa a galeria
      updateGallery("pagination"); // Inicia a paginação
    }
  });

  function filterAndPaginateData() {
    // Filtragem por busca
    let filteredData = allData;
    const searchText = searchBar.val().toLowerCase();
    if (searchText) {
      filteredData = filteredData.filter(
        (item) => item.name.toLowerCase().includes(searchText) || item.tags.some((tag) => tag.toLowerCase().includes(searchText))
      );
    }

    // Filtragem por tags selecionadas
    if (selectedTags.length > 0) {
      filteredData = filteredData.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
    }

    return filteredData;
  }
  // Controla a exibição da galeria
  function updateGallery(loadMode = "pagination") {
    const filteredData = filterAndPaginateData();

    if (loadMode === "pagination") {
      const start = (currentPage - 1) * itemsPerLoad;
      const paginatedData = filteredData.slice(start, start + itemsPerLoad);
      renderGallery(paginatedData);
    } else if (loadMode === "infinite") {
      const displayedItems = gallery.children().length;
      const nextBatch = filteredData.slice(displayedItems, displayedItems + itemsPerLoad);
      renderGallery(nextBatch, false); // Adiciona ao conteúdo existente
    }
  }
  const searchBar = $("#search-bar");
  const filterButton = $("#filter-button");
  const filterDropdown = $("#filter-dropdown");
  const filterTagsContainer = $("#filter-tags");
  let selectedTags = [];
  const sortOptions = $("#sort-options");
  sortOptions.on("change", function () {
    sortData($(this).val());
    filterGallery();
  });

  function sortData(option) {
    switch (option) {
      case "name-asc":
        allData.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        allData.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Caso queira voltar ao estado original, você pode:
        // - Manter uma cópia inicial de allData antes do sort
        // - Ou simplesmente não fazer nada, se o default já é a ordem original
        break;
    }
  }

  // Fetch data from JSON
  $.getJSON("pecas.json", function (data) {
    allData = data;
    renderTags(getAllTags(data)); // Gera a lista de tags
    renderGallery(data);
  });

  // Abrir/Fechar Dropdown de Filtros
  filterButton.on("click", function (e) {
    e.stopPropagation(); // Impede que o clique feche o dropdown acidentalmente
    filterDropdown.toggle(); // Alterna entre mostrar/ocultar
  });

  // Fechar o dropdown ao clicar fora
  $(document).on("click", function () {
    filterDropdown.hide(); // Esconde o dropdown se o clique for fora
  });

  // Impede o fechamento do dropdown ao clicar dentro dele
  filterDropdown.on("click", function (e) {
    e.stopPropagation();
  });

  // Gera as tags dinâmicas
  function renderTags(tags) {
    tags.forEach((tag) => {
      filterTagsContainer.append(`
                  <span class="filter-tag" data-tag="${tag}">${tag}</span>
              `);
    });

    // Adiciona evento de clique para selecionar/deselecionar tags
    $(".filter-tag").on("click", function () {
      const tag = $(this).data("tag");
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter((t) => t !== tag);
        $(this).removeClass("active");
      } else {
        selectedTags.push(tag);
        $(this).addClass("active");
      }
      filterGallery(); // Atualiza a galeria com os filtros selecionados
    });
  }

  // Extrai todas as tags únicas do JSON
  function getAllTags(data) {
    const tags = new Set();
    data.forEach((item) => item.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }

  // Filtro da Galeria
  function filterGallery() {
    let filteredData = allData;

    // Filtrar por texto no campo de busca
    const searchText = searchBar.val().toLowerCase();
    if (searchText) {
      filteredData = filteredData.filter(
        (item) => item.name.toLowerCase().includes(searchText) || item.tags.some((tag) => tag.toLowerCase().includes(searchText))
      );
    }

    // Filtrar por tags selecionadas
    if (selectedTags.length > 0) {
      filteredData = filteredData.filter((item) => selectedTags.every((tag) => item.tags.includes(tag)));
    }

    renderGallery(filteredData);
  }

  // Atualiza a galeria ao digitar na barra de busca
  searchBar.on("input", filterGallery);
});
