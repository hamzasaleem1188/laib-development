if (!customElements.get("custom-shirt-customizer")) {
  customElements.define(
    "custom-shirt-customizer",
    class CustomShirtCustomizer extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.toggleBtn = this.querySelector("[data-toggle]");
        this.drawer = this.querySelector("[data-drawer]");
        this.closeBtn = this.querySelector("[data-close-drawer]");
        this.nameInput = this.querySelector("[data-name-input]");
        this.numberInput = this.querySelector("[data-number-input]");
        this.nameCounter = this.querySelector("[data-name-counter]");
        this.numberCounter = this.querySelector("[data-number-counter]");

        // Validation Error Elements
        this.errorNationality = this.querySelector("[data-error-nationality]");
        this.errorLogo = this.querySelector("[data-error-logo]");
        this.errorName = this.querySelector("[data-error-name]");
        this.errorNumber = this.querySelector("[data-error-number]");

        this.flagSelect = this.querySelector("[data-flag-select]");
        if (this.flagSelect) {
          this.flagSelected = this.flagSelect.querySelector(".select-selected");
          this.flagItems = this.flagSelect.querySelector(".select-items");
          this.flagSearch = this.flagSelect.querySelector("[data-flag-search]");
          this.flagList = this.flagSelect.querySelector("[data-flag-list]");
          this.flagInput = this.querySelector("[data-flag-input]");
          this.selectedName = this.flagSelect.querySelector(
            "[data-selected-name]",
          );
          this.dropdownClearBtn = this.flagSelect.querySelector(
            "[data-dropdown-clear]",
          );
          this.flagUrlInput = this.querySelector("[data-flag-url-input]");
        }

        // Logo Selector Elements
        this.logoSelect = this.querySelector("[data-logo-select]");
        if (this.logoSelect) {
          this.logoSelected = this.logoSelect.querySelector(".select-selected");
          this.logoItems = this.logoSelect.querySelector(".select-items");
          this.logoSearch = this.logoSelect.querySelector("[data-logo-search]");
          this.logoList = this.logoSelect.querySelector("[data-logo-list]");
          this.logoInput = this.querySelector("[data-logo-input]");
          this.logoClearBtn = this.logoSelect.querySelector(
            "[data-logo-dropdown-clear]",
          );
          this.logoUrlInput = this.querySelector("[data-logo-url-input]");
          this.nationalityCityInput = this.querySelector(
            "[data-logo-text-url-input]",
          );
          this.nationalityCityCounter = this.querySelector(
            "[data-nationality-counter]",
          );
        }

        this.updateClearButtons();

        this.priceLabel =
          this.querySelector('[id^="CustomPriceLabel-"]') ||
          document.querySelector('[id^="CustomPriceLabel-"]');
        const jsonScript =
          this.querySelector('[id^="ProductJSON-"]') ||
          document.querySelector('[id^="ProductJSON-"]');
        this.productData = jsonScript
          ? JSON.parse(jsonScript.textContent)
          : null;

        this.form = this.querySelector('form[data-type="add-to-cart-form"]');
        this.submitBtn = this.form?.querySelector('[type="submit"]');
        this.validationActive = false;

        if (this.submitBtn) {
          this.submitBtn.addEventListener(
            "click",
            (e) => {
              this.validationActive = true;
              if (!this.validateCustomization()) {
                e.preventDefault();
                e.stopImmediatePropagation();
              }
            },
            { capture: true },
          );
        }

        // Real-time error clearing/showing
        if (this.nameInput) {
          this.nameInput.addEventListener("input", () => {
            if (this.validationActive) {
              this.validateCustomization();
            } else if (this.nameInput.value.trim() !== "" && this.errorName) {
              this.errorName.style.display = "none";
            }
          });
        }
        if (this.numberInput) {
          this.numberInput.addEventListener("input", () => {
            if (this.validationActive) {
              this.validateCustomization();
            } else if (
              this.numberInput.value.trim() !== "" &&
              this.errorNumber
            ) {
              this.errorNumber.style.display = "none";
            }
          });
        }

        this.countries = [
          { name: "Afghanistan", code: "af" },
          { name: "Argentina", code: "ar" },
          { name: "Australia", code: "au" },
          { name: "Austria", code: "at" },
          { name: "Bangladesh", code: "bd" },
          { name: "Belgium", code: "be" },
          { name: "Brazil", code: "br" },
          { name: "Bulgaria", code: "bg" },
          { name: "Canada", code: "ca" },
          { name: "Chile", code: "cl" },
          { name: "China", code: "cn" },
          { name: "Colombia", code: "co" },
          { name: "Croatia", code: "hr" },
          { name: "Cuba", code: "cu" },
          { name: "Czechia", code: "cz" },
          { name: "Denmark", code: "dk" },
          { name: "Egypt", code: "eg" },
          { name: "Finland", code: "fi" },
          { name: "France", code: "fr" },
          { name: "Germany", code: "de" },
          { name: "Ghana", code: "gh" },
          { name: "Greece", code: "gr" },
          { name: "Hungary", code: "hu" },
          { name: "Iceland", code: "is" },
          { name: "India", code: "in" },
          { name: "Indonesia", code: "id" },
          { name: "Iran", code: "ir" },
          { name: "Iraq", code: "iq" },
          { name: "Ireland", code: "ie" },
          { name: "Israel", code: "il" },
          { name: "Italy", code: "it" },
          { name: "Japan", code: "jp" },
          { name: "Jordan", code: "jo" },
          { name: "Kazakhstan", code: "kz" },
          { name: "Kenya", code: "ke" },
          { name: "Kuwait", code: "kw" },
          { name: "Lebanon", code: "lb" },
          { name: "Malaysia", code: "my" },
          { name: "Mexico", code: "mx" },
          { name: "Morocco", code: "ma" },
          { name: "Netherlands", code: "nl" },
          { name: "New Zealand", code: "nz" },
          { name: "Nigeria", code: "ng" },
          { name: "North Korea", code: "kp" },
          { name: "Norway", code: "no" },
          { name: "Oman", code: "om" },
          { name: "Pakistan", code: "pk" },
          { name: "Palestine", code: "ps" },
          { name: "Peru", code: "pe" },
          { name: "Philippines", code: "ph" },
          { name: "Poland", code: "pl" },
          { name: "Portugal", code: "pt" },
          { name: "Qatar", code: "qa" },
          { name: "Romania", code: "ro" },
          { name: "Russia", code: "ru" },
          { name: "Saudi Arabia", code: "sa" },
          { name: "Serbia", code: "rs" },
          { name: "Singapore", code: "sg" },
          { name: "Slovakia", code: "sk" },
          { name: "Slovenia", code: "si" },
          { name: "South Africa", code: "za" },
          { name: "South Korea", code: "kr" },
          { name: "Spain", code: "es" },
          { name: "Sri Lanka", code: "lk" },
          { name: "Sweden", code: "se" },
          { name: "Switzerland", code: "ch" },
          { name: "Syria", code: "sy" },
          { name: "Taiwan", code: "tw" },
          { name: "Thailand", code: "th" },
          { name: "Turkey", code: "tr" },
          { name: "Ukraine", code: "ua" },
          { name: "United Arab Emirates", code: "ae" },
          { name: "United Kingdom", code: "gb" },
          { name: "United States", code: "us" },
          { name: "Uruguay", code: "uy" },
          { name: "Uzbekistan", code: "uz" },
          { name: "Venezuela", code: "ve" },
          { name: "Vietnam", code: "vn" },
          { name: "Yemen", code: "ye" },
          { name: "Zambia", code: "zm" },
          { name: "Zimbabwe", code: "zw" },
        ];

        if (this.toggleBtn)
          this.toggleBtn.addEventListener(
            "click",
            this.toggleDrawer.bind(this),
          );
        if (this.closeBtn)
          this.closeBtn.addEventListener("click", this.toggleDrawer.bind(this));

        if (this.flagSelected)
          this.flagSelected.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.flagItems.classList.contains("select-hide")) {
              this.flagItems.classList.remove("select-hide");
            } else {
              this.closeFlagDropdown();
            }
          });

        if (this.flagItems)
          this.flagItems.addEventListener("click", (e) => {
            e.stopPropagation();
          });

        if (this.flagSearch)
          this.flagSearch.addEventListener("input", () =>
            this.populateFlags(this.flagSearch.value),
          );

        // Logo Selector Observers
        if (this.logoSelected) {
          this.logoSelected.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.logoItems) {
              if (this.logoItems.classList.contains("select-hide")) {
                this.logoItems.classList.remove("select-hide");
              } else {
                this.closeLogoDropdown();
              }
            }
          });
        }

        if (this.logoItems) {
          this.logoItems.addEventListener("click", (e) => {
            e.stopPropagation();
            const item = e.target.closest(".item");
            if (!item) return;

            const val = item.getAttribute("data-value");
            const url = item.getAttribute("data-logo-url");
            const labelUrl = item.getAttribute("data-label-url");
            const span = item.querySelector("span");
            const labelText = span ? span.innerText.trim() : val;

            if (this.logoInput) this.logoInput.value = val;
            if (this.logoUrlInput) this.logoUrlInput.value = url;
            if (this.nationalityCityInput) {
              this.nationalityCityInput.dispatchEvent(new Event("input"));
            }
            if (this.logoSelect) {
              const selectedDisplay = this.logoSelect.querySelector(
                "[data-selected-name]",
              );
              if (selectedDisplay) selectedDisplay.innerText = val;
            }
            if (this.logoItems) this.closeLogoDropdown();
            this.updateVariantOption();
            this.updateClearButtons();
            if (this.validationActive) {
              this.validateCustomization();
            } else if (this.errorLogo) {
              this.errorLogo.style.display = "none";
            }

            if (
              window.innerWidth < 1024 &&
              this.dataset.onlyCustomInputs !== "true"
            ) {
              this.scrollToPreview();
            }
          });
        }

        if (this.nationalityCityInput) {
          this.bindSanitizedLetterField(this.nationalityCityInput, () => {
            if (this.nationalityCityCounter) {
              this.nationalityCityCounter.innerText = `${this.nationalityCityInput.value.length}/12`;
            }
            this.updateLogoPreview(
              this.logoUrlInput?.value,
              this.nationalityCityInput.value,
            );
            this.updateVariantOption();
            if (window.switchMedia) window.switchMedia("front");
            this.debouncedScroll();
          });
        }

        if (this.logoSearch) {
          this.logoSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const items = this.logoList.querySelectorAll(".item");
            items.forEach((item) => {
              const text = item.textContent.toLowerCase();
              item.style.display = text.includes(query) ? "" : "none";
            });
          });
        }

        this.debouncedScroll = this.debounce(() => {
          if (this.dataset.onlyCustomInputs === "true") return;
          if (window.innerWidth < 1024) {
            this.scrollToPreview();
          }
        }, 1000);

        this.bindSanitizedLetterField(this.nameInput, () => {
          this.updatePreview();
          if (window.switchMedia) window.switchMedia("back");
          this.debouncedScroll();
        });
        if (this.numberInput)
          this.numberInput.addEventListener("input", () => {
            this.updatePreview();
            if (window.switchMedia) window.switchMedia("back");
            this.debouncedScroll();
          });

        if (this.clearBtn)
          this.clearBtn.addEventListener("click", () => {
            this.clearCustomization();
            this.updateClearButtons();
          });

        if (this.dropdownClearBtn)
          this.dropdownClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.flagSearch) this.flagSearch.value = "";
            this.populateFlags();
            this.selectFlag({ name: "", code: "" });
            this.updateClearButtons();
          });

        if (this.logoClearBtn) {
          this.logoClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.logoSearch) this.logoSearch.value = "";
            if (this.logoList) {
              const items = this.logoList.querySelectorAll(".item");
              items.forEach((item) => (item.style.display = ""));
            }
            if (this.logoInput) this.logoInput.value = "";
            if (this.logoUrlInput) this.logoUrlInput.value = "";
            if (this.nationalityCityInput) {
              this.nationalityCityInput.value = "";
              if (this.nationalityCityCounter)
                this.nationalityCityCounter.innerText = "0/12";
            }
            if (this.logoSelect) {
              const selectedDisplay = this.logoSelect.querySelector(
                "[data-selected-name]",
              );
              if (selectedDisplay)
                selectedDisplay.innerText = "select nationality";
            }
            if (this.logoItems) this.logoItems.classList.add("select-hide");
            this.updateLogoPreview("", "", "");
            this.updateVariantOption();
            this.updateClearButtons();
          });
        }

        window.addEventListener("click", () => {
          this.closeFlagDropdown();
          this.closeLogoDropdown();
        });

        this.populateFlags();
        this.setupPriceObserver();

        setTimeout(() => {
          if (this.nameInput) this.nameInput.value = "";
          if (this.numberInput) this.numberInput.value = "";
          if (this.flagInput) {
            this.flagInput.value = "";
            if (this.selectedName)
              this.selectedName.innerText = "Select Nationality";
            this.updateFlagPreview("", "");
          }
          this.updatePreview();
          this.updateVariantOption();
        }, 100);

        // Reset customizer after successful add to cart
        if (
          typeof subscribe === "function" &&
          typeof PUB_SUB_EVENTS !== "undefined" &&
          PUB_SUB_EVENTS.cartUpdate
        ) {
          subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
            this.clearCustomization();
            this.validationActive = false;

            // Hide all errors
            if (this.errorNationality)
              this.errorNationality.style.display = "none";
            if (this.errorLogo) this.errorLogo.style.display = "none";
            if (this.errorName) this.errorName.style.display = "none";
            if (this.errorNumber) this.errorNumber.style.display = "none";

            // If drawer is open, close it (reset to "Customize" button state)
            if (this.drawer && this.drawer.style.display !== "none") {
              this.toggleDrawer();
            }
          });
        }
        this.initSizeChart();
      }

      initSizeChart() {
        // Move modals to body to avoid transform parents
        document.querySelectorAll(".custom-modal").forEach((modal) => {
          if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
          }
        });

        // Add Styles
        if (!document.getElementById("CustomModalStyles")) {
          const style = document.createElement("style");
          style.id = "CustomModalStyles";
          style.textContent = `
            .size-chart-trigger {
              background: none;
              border: none;
              padding: 0;
              margin: 0;
              font-size: 1.2rem;
              text-decoration: underline;
              cursor: pointer;
              color: #666;
              font-style: italic;
              font-family: inherit;
              transition: color 0.3s ease;
            }
            .size-chart-trigger:hover {
              color: #000;
            }
            .custom-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              z-index: 200000;
              display: none;
              align-items: center;
              justify-content: center;
              opacity: 0;
              visibility: hidden;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              padding: 20px;
            }
            .custom-modal.is-open {
              display: flex !important;
              opacity: 1;
              visibility: visible;
            }
            .custom-modal__overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(255, 255, 255, 0.3);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .custom-modal__content {
              position: relative;
              background: white;
              padding: 40px 15px 15px;
              width: 100%;
              max-width: 800px;
              max-height: 90vh;
              border-radius: 8px;
              box-shadow: 0 30px 60px rgba(0,0,0,0.12);
              transform: translateY(30px) scale(0.98);
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 1;
              overflow: auto;
              display: flex;
              flex-direction: column;
            }
            .custom-modal.is-open .custom-modal__content {
              transform: translateY(0) scale(1);
            }
            .custom-modal__close {
              position: absolute;
              top: 10px;
              right: 15px;
              background: rgba(255,255,255,0.8);
              border: none;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              cursor: pointer;
              z-index: 2;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .custom-modal__body {
              width: 100%;
              height: auto;
            }
            .custom-modal__body img {
              display: block;
              width: 100%;
              height: auto;
              object-fit: contain;
            }
            @media screen and (max-width: 749px) {
              .custom-modal {
                padding: 10px;
              }
              .custom-modal__content {
                padding: 40px 10px 10px;
                max-height: 95vh;
              }
            }
            body.modal-open {
              overflow: hidden !important;
            }
          `;
          document.head.appendChild(style);
        }

        // Add Listeners
        if (!this.modalListenersSet) {
          document.addEventListener("click", (e) => {
            const trigger = e.target.closest("[data-modal-trigger]");
            if (trigger) {
              const modalId = trigger.getAttribute("data-modal-trigger");
              const modal = document.getElementById(modalId);
              if (modal) {
                modal.classList.add("is-open");
                document.body.classList.add("modal-open");
              }
            }

            if (e.target.closest("[data-modal-close]")) {
              const modal = e.target.closest(".custom-modal");
              if (modal) {
                modal.classList.remove("is-open");
                document.body.classList.remove("modal-open");
              }
            }
          });
          this.modalListenersSet = true;
        }
      }

      populateFlags(search = "") {
        if (!this.flagList) return;
        this.flagList.innerHTML = "";

        const filtered = this.countries.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        );
        filtered.forEach((country) => {
          const div = document.createElement("div");
          div.className = "item";
          div.innerHTML = `<img src="https://flagcdn.com/w40/${country.code}.png" class="item-flag" alt="${country.name}"> ${country.name}`;
          div.addEventListener("click", () => this.selectFlag(country));
          this.flagList.appendChild(div);
        });
      }

      selectFlag(country) {
        if (this.flagInput) this.flagInput.value = country.name;
        if (this.flagUrlInput) {
          this.flagUrlInput.value = country.code
            ? `https://flagcdn.com/w80/${country.code}.png`
            : "";
        }
        if (this.selectedName) {
          if (country.code) {
            this.selectedName.innerHTML = `<img src="https://flagcdn.com/w40/${country.code}.png" class="item-flag" alt="${country.name}"> ${country.name}`;
          } else {
            this.selectedName.innerText = "Select Nationality";
          }
        }
        this.closeFlagDropdown();
        this.updateClearButtons();
        if (this.validationActive) {
          this.validateCustomization();
        } else if (this.errorNationality) {
          this.errorNationality.style.display = "none";
        }
        this.updateFlagPreview(country.code, country.name);
        this.updateVariantOption();

        // Smooth scroll to preview on mobile/tablet
        if (window.innerWidth < 1024) {
          this.scrollToPreview();
        }
      }

      scrollToPreview() {
        const selectors = [
          ".custom-media-images",
          ".custom-media-gallery",
          ".product__media-wrapper",
          "product-media-gallery",
          ".product__media-list",
          "#media-slider-wrapper",
        ];

        let preview = null;
        for (const selector of selectors) {
          preview = document.querySelector(selector);
          if (preview && preview.offsetWidth > 0 && preview.offsetHeight > 0)
            break;
        }

        if (preview) {
          const yOffset = -60; // Offset for better spacing on mobile top
          const y =
            preview.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }

      updateFlagPreview(code, name) {
        const frontFlag = document.getElementById("PreviewFlagFront");
        const backFlag = document.getElementById("PreviewFlagBack");
        const frontContainer = document.getElementById(
          "PreviewFlagFrontContainer",
        );
        const backContainer = document.getElementById(
          "PreviewFlagBackContainer",
        );
        const countryNameContainer = document.getElementById(
          "PreviewCountryNameContainer",
        );
        const countryNameElement =
          document.getElementById("PreviewCountryName");

        if (frontFlag && code) {
          frontFlag.src = `https://flagcdn.com/w80/${code}.png`;
          if (frontContainer) frontContainer.style.display = "block";
        } else if (frontFlag) {
          if (frontContainer) frontContainer.style.display = "none";
        }

        if (countryNameElement && name && code) {
          countryNameElement.innerText = name;
          countryNameElement.setAttribute("data-char-count", name.length);
          if (countryNameContainer)
            countryNameContainer.style.display = "block";
        } else if (countryNameContainer) {
          countryNameContainer.style.display = "none";
        }

        if (backFlag && code) {
          backFlag.src = `https://flagcdn.com/w80/${code}.png`;
          if (backContainer) backContainer.style.display = "block";
        } else if (backFlag) {
          if (backContainer) backContainer.style.display = "none";
        }
      }

      updateLogoPreview(logoUrl, labelText) {
        const frontFlag = document.getElementById("PreviewFlagFront");
        const backFlag = document.getElementById("PreviewFlagBack");
        const frontContainer = document.getElementById(
          "PreviewFlagFrontContainer",
        );
        const backContainer = document.getElementById(
          "PreviewFlagBackContainer",
        );
        const frontLogoLabel = document.getElementById("PreviewLogoLabel");
        const frontLogoLabelContainer = document.getElementById(
          "PreviewLogoLabelContainer",
        );

        // Update Flag/Logo Icons
        if (frontFlag && logoUrl) {
          frontFlag.src = logoUrl;
          if (frontContainer) frontContainer.style.display = "block";
        } else if (frontFlag && !this.flagInput?.value) {
          if (frontContainer) frontContainer.style.display = "none";
        }

        if (backFlag && logoUrl) {
          backFlag.src = logoUrl;
          if (backContainer) backContainer.style.display = "block";
        } else if (backFlag && !this.flagInput?.value) {
          if (backContainer) backContainer.style.display = "none";
        }

        // Update Label Text (formerly Image)
        if (frontLogoLabel && labelText) {
          frontLogoLabel.innerText = labelText;
          frontLogoLabel.setAttribute("data-char-count", labelText.length);
          if (frontLogoLabelContainer)
            frontLogoLabelContainer.style.display = "block";
        } else if (frontLogoLabel) {
          frontLogoLabel.innerText = "";
          if (frontLogoLabelContainer)
            frontLogoLabelContainer.style.display = "none";
        }
      }

      toggleDrawer() {
        if (!this.drawer) return;
        const isHidden = this.drawer.style.display === "none";
        this.drawer.style.display = isHidden ? "block" : "none";

        if (this.dataset.onlyCustomInputs === "true" && isHidden) {
          const customizedImg =
            document.querySelector(
              'media-gallery img[alt="customized_shirt"]',
            ) ||
            document.querySelector('media-gallery img[alt="customized shirt"]');

          if (customizedImg) {
            const mediaItem = customizedImg.closest("[data-media-id]");
            if (mediaItem) {
              const mediaId = mediaItem.dataset.mediaId;
              const mediaGallery = document.querySelector("media-gallery");
              if (mediaGallery && mediaGallery.setActiveMedia) {
                mediaGallery.setActiveMedia(mediaId, false);

                // Add smooth horizontal slide effect
                setTimeout(() => {
                  const container = mediaItem.parentElement;
                  if (container) {
                    container.scrollTo({
                      left: mediaItem.offsetLeft,
                      behavior: "smooth",
                    });
                  }
                }, 200);
              }
            }
          }
          if (window.innerWidth < 768) {
            this.scrollToPreview();
          }
        }

        if (this.toggleBtn) {
          this.toggleBtn.innerText = isHidden ? "Done" : "Customize";
        }

        /*
        const variantPicker =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (variantPicker) variantPicker.style.display = isHidden ? "none" : "";
        */
        if (isHidden) {
          const backBtn = document.querySelector(
            ".custom-media-controls button:last-child",
          );
          if (backBtn) backBtn.click();
        }
      }

      clearCustomization() {
        if (this.nameInput) this.nameInput.value = "";
        if (this.numberInput) this.numberInput.value = "";
        if (this.flagInput) {
          this.flagInput.value = "";
          if (this.selectedName)
            this.selectedName.innerText = "Select Nationality";
          this.updateFlagPreview("", "");
        }
        if (this.logoInput) {
          this.logoInput.value = "";
          if (this.logoUrlInput) this.logoUrlInput.value = "";
          if (this.nationalityCityInput) {
            this.nationalityCityInput.value = "";
            if (this.nationalityCityCounter)
              this.nationalityCityCounter.innerText = "0/12";
          }
          if (this.logoSelect) {
            const selectedDisplay = this.logoSelect.querySelector(
              "[data-selected-name]",
            );
            if (selectedDisplay)
              selectedDisplay.innerText = "select nationality";
          }
          this.updateLogoPreview("", "", "");
        }
        this.updatePreview();
        this.updateVariantOption();
        this.updateClearButtons();
      }

      updatePreview() {
        const previewName = document.getElementById("PreviewName");
        const previewNumber = document.getElementById("PreviewNumber");

        if (this.nameInput && this.nameCounter) {
          this.nameCounter.innerText = `${this.nameInput.value.length}/10`;
        }
        if (this.numberInput && this.numberCounter) {
          this.numberCounter.innerText = `${this.numberInput.value.length}/2`;
        }

        if (previewName && this.nameInput) {
          const name = this.nameInput.value;
          previewName.innerText = name;
          previewName.setAttribute("data-char-count", name.length);
        }
        if (previewNumber && this.numberInput) {
          const num = this.numberInput.value;
          previewNumber.innerText = num;
          previewNumber.setAttribute("data-char-count", num.length);
        }
        if (this.nationalityCityInput) {
          this.updateLogoPreview(
            this.logoUrlInput?.value,
            this.nationalityCityInput.value,
          );
        }
        this.updateVariantOption();
      }

      updateVariantOption() {
        const hasNameNum =
          (this.nameInput && this.nameInput.value.trim() !== "") ||
          (this.numberInput && this.numberInput.value.trim() !== "");
        const hasLogo = this.logoInput && this.logoInput.value.trim() !== "";
        const hasCity =
          this.nationalityCityInput &&
          this.nationalityCityInput.value.trim() !== "";

        const hasCustomization = hasNameNum || hasLogo || hasCity;

        const container =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (!container) return;

        // Customization Groups mapping
        const optionNames = ["Flag", "Personalization", "NameAndNumber"];

        optionNames.forEach((optionName) => {
          let optionSelect = container.querySelector(
            `select[name="options[${optionName}]"]`,
          );
          let optionRadios = Array.from(
            container.querySelectorAll(`input[name^="${optionName}"]`),
          );

          if (!optionSelect && optionRadios.length === 0) {
            const labels = container.querySelectorAll(
              ".form__label, label, legend",
            );
            for (const label of labels) {
              const labelText = label.textContent
                .split(":")[0]
                .trim()
                .toLowerCase();
              if (labelText === optionName.toLowerCase()) {
                const parent = label.closest(".product-form__input");
                if (parent) {
                  optionSelect = parent.querySelector("select");
                  const radioSelectors = [
                    'input[type="radio"]',
                    'input[name^="' + optionName + '"]',
                  ];
                  optionRadios = Array.from(
                    parent.querySelectorAll(radioSelectors.join(",")),
                  );
                }
                break;
              }
            }
          }

          if (optionSelect || optionRadios.length > 0) {
            let targetValue = "NO";

            // Get available values for this option
            const availableValues = optionSelect
              ? Array.from(optionSelect.options).map((o) => o.value)
              : optionRadios.map((r) => r.value);

            if (optionName === "Personalization") {
              if (hasCustomization) {
                // Determine tiered value based on feature combination (Priority: Full > Combo > Single)
                const comboFull = ["Full"];
                const comboNameLogo = ["Name/Num/Logo"];
                const comboNameCity = ["Name/Num/City"];
                const comboLogoCity = ["Logo/City"];
                const comboNameOnly = ["Name/Num"];
                const comboLogoOnly = ["Logo"];
                const comboCityOnly = ["City"];

                if (hasNameNum && hasLogo && hasCity) {
                  targetValue =
                    comboFull.find((v) => availableValues.includes(v)) ||
                    "Full";
                } else if (hasNameNum && hasLogo) {
                  targetValue =
                    comboNameLogo.find((v) => availableValues.includes(v)) ||
                    "Name/Num/Logo";
                } else if (hasNameNum && hasCity) {
                  targetValue =
                    comboNameCity.find((v) => availableValues.includes(v)) ||
                    "Name/Num/City";
                } else if (hasLogo && hasCity) {
                  targetValue =
                    comboLogoCity.find((v) => availableValues.includes(v)) ||
                    "Logo/City";
                } else if (hasNameNum) {
                  targetValue =
                    comboNameOnly.find((v) => availableValues.includes(v)) ||
                    "Name/Num";
                } else if (hasLogo) {
                  targetValue =
                    comboLogoOnly.find((v) => availableValues.includes(v)) ||
                    "Logo";
                } else if (hasCity) {
                  targetValue =
                    comboCityOnly.find((v) => availableValues.includes(v)) ||
                    "City";
                }

                // Fallback to "YES" if the specific tiered value isn't available but "YES" is
                if (
                  !availableValues.includes(targetValue) &&
                  availableValues.includes("YES")
                ) {
                  targetValue = "YES";
                }
              }
            } else if (optionName === "Flag") {
              // Flag only switches to YES if a logo is selected (icon-based)
              targetValue = hasLogo ? "YES" : "NO";
            }

            // Apply targetValue to UI
            if (optionSelect && optionSelect.value !== targetValue) {
              optionSelect.value = targetValue;
              optionSelect.dispatchEvent(
                new Event("change", { bubbles: true }),
              );
            } else if (optionRadios.length > 0) {
              const targetRadio = optionRadios.find(
                (r) => r.value === targetValue,
              );
              if (targetRadio && !targetRadio.checked) {
                targetRadio.checked = true;
                targetRadio.dispatchEvent(
                  new Event("change", { bubbles: true }),
                );
              }
            }
          }
        });

        this.updatePriceBreakdown(hasCustomization);

        // Update Return Policy Notice highlighting
        const returnPolicyNotice = document.querySelector(
          ".personalization-return-policy",
        );
        if (returnPolicyNotice) {
          if (hasCustomization) {
            returnPolicyNotice.classList.add("is-active");
          } else {
            returnPolicyNotice.classList.remove("is-active");
          }
        }
      }

      setupPriceObserver() {
        // Find the price container. Dawn usually updates the content of [role="status"] or the .price div inside it.
        const priceContainer = document.querySelector('[id^="price-"]');
        if (!priceContainer) return;

        this.observer = new MutationObserver((mutations) => {
          // When Dawn updates the price, our label might be destroyed or hidden.
          // We re-apply our logic.
          const hasNameNum =
            (this.nameInput && this.nameInput.value.trim() !== "") ||
            (this.numberInput && this.numberInput.value.trim() !== "");
          const hasLogo = this.logoInput && this.logoInput.value.trim() !== "";
          const hasCity =
            this.nationalityCityInput &&
            this.nationalityCityInput.value.trim() !== "";

          const hasCustomization = hasNameNum || hasLogo || hasCity;

          // Use a slight delay to ensure Dawn finished its DOM replacement
          setTimeout(() => this.updatePriceBreakdown(hasCustomization), 50);
        });

        this.observer.observe(priceContainer, {
          childList: true,
          subtree: true,
        });
      }

      updatePriceBreakdown(hasCustomization) {
        // Re-find price label as it might have been replaced in the DOM by theme JS
        this.priceLabel =
          this.querySelector('[id^="CustomPriceLabel-"]') ||
          document.querySelector('[id^="CustomPriceLabel-"]');
        if (!this.priceLabel || !this.productData) return;

        if (!hasCustomization) {
          this.priceLabel.style.display = "none";
          return;
        }

        const container =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (!container) return;

        // Find variant prices based on current UI state
        const findVariantPrice = (forceCustomNo = false) => {
          const matchingVariant = this.productData.variants.find((v) => {
            return v.options.every((opt, index) => {
              const optName = this.productData.options[index];
              if (
                forceCustomNo &&
                (optName === "Flag" || optName === "Personalization")
              ) {
                return opt === "NO";
              }

              // Try different selector patterns for Dawn variants
              let uiValue = "";
              const select =
                container.querySelector(`select[name="options[${optName}]"]`) ||
                container.querySelector(`select[name^="${optName}"]`);
              if (select) {
                uiValue = select.value;
              } else {
                // Try exact name, then partial name match for radios/buttons
                const checkedInput =
                  container.querySelector(
                    `input[name="options[${optName}]"]:checked`,
                  ) ||
                  container.querySelector(
                    `input[name^="${optName}"]:checked`,
                  ) ||
                  container.querySelector(
                    `input[data-option-name="${optName}"]:checked`,
                  );
                if (checkedInput) uiValue = checkedInput.value;
              }

              return !uiValue || opt === uiValue;
            });
          });
          return matchingVariant ? matchingVariant.price : null;
        };

        const basePrice = findVariantPrice(true);
        const currentPrice = findVariantPrice(false);

        if (basePrice && currentPrice && currentPrice > basePrice) {
          const diff = currentPrice - basePrice;
          const currency = window.Shopify?.currency?.active || "";

          const format = (cents) => {
            if (window.Shopify?.formatMoney) {
              return window.Shopify.formatMoney(cents);
            }
            return `${(cents / 100).toFixed(2)} ${currency}`;
          };

          this.priceLabel.innerHTML = `${format(basePrice)} + ${format(diff)} (Personalization)`;
          this.priceLabel.style.display = "block";
        }
      }

      // handleFormSubmit is no longer used, replaced by click listener on button

      /**
       * Keeps personalization text to letters and spaces, but allows combining marks
       * and spacing modifier symbols (e.g. ¨) so Swedish ä/ö/å work with dead keys and IME.
       */
      sanitizePersonalizationText(value) {
        return String(value)
          .normalize("NFC")
          .replace(/[^\p{L}\p{M}\p{Sk}\s]/gu, "");
      }

      bindSanitizedLetterField(inputEl, onAfterChange) {
        if (!inputEl) return;
        let composing = false;
        const apply = () => {
          const next = this.sanitizePersonalizationText(inputEl.value);
          if (next !== inputEl.value) inputEl.value = next;
          onAfterChange();
        };
        inputEl.addEventListener("compositionstart", () => {
          composing = true;
        });
        inputEl.addEventListener("compositionend", () => {
          composing = false;
          apply();
        });
        inputEl.addEventListener("input", (e) => {
          if (composing || e.isComposing) return;
          apply();
        });
      }

      validateCustomization() {
        // Reset errors
        if (this.errorNationality) this.errorNationality.style.display = "none";
        if (this.errorLogo) this.errorLogo.style.display = "none";
        if (this.errorName) this.errorName.style.display = "none";
        if (this.errorNumber) this.errorNumber.style.display = "none";

        let hasError = false;

        // Name and Number must be provided together
        const nameValue = this.nameInput ? this.nameInput.value.trim() : "";
        const numberValue = this.numberInput
          ? this.numberInput.value.trim()
          : "";

        if (nameValue !== "" && numberValue === "") {
          if (this.errorNumber) this.errorNumber.style.display = "block";
          hasError = true;
        }
        if (numberValue !== "" && nameValue === "") {
          if (this.errorName) this.errorName.style.display = "block";
          hasError = true;
        }

        if (hasError) {
          // Open drawer if name/number errors are present and drawer is closed
          if (this.drawer && this.drawer.style.display === "none") {
            this.drawer.style.display = "block";
            if (this.toggleBtn) this.toggleBtn.style.display = "none";
          }

          // Scroll to the first error
          const firstError = [this.errorName, this.errorNumber].find(
            (err) => err && err.style.display === "block",
          );
          if (firstError) {
            firstError.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }

          return false;
        }

        return true;
      }

      debounce(fn, wait) {
        let t;
        return (...args) => {
          clearTimeout(t);
          t = setTimeout(() => fn.apply(this, args), wait);
        };
      }

      updateClearButtons() {
        if (this.dropdownClearBtn) {
          this.dropdownClearBtn.style.display =
            this.flagInput && this.flagInput.value ? "flex" : "none";
        }
        if (this.logoClearBtn) {
          this.logoClearBtn.style.display =
            this.logoInput && this.logoInput.value ? "flex" : "none";
        }
      }

      closeFlagDropdown() {
        if (!this.flagItems) return;
        this.flagItems.classList.add("select-hide");
        if (this.flagSearch) this.flagSearch.value = "";
        this.populateFlags();
      }

      closeLogoDropdown() {
        if (!this.logoItems) return;
        this.logoItems.classList.add("select-hide");
        if (this.logoSearch) this.logoSearch.value = "";
        if (this.logoList) {
          const items = this.logoList.querySelectorAll(".item");
          items.forEach((item) => (item.style.display = ""));
        }
      }
    },
  );
}
