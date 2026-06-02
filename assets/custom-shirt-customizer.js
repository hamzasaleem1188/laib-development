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
        }

        // Independent Nationality/City Input Elements
        this.nationalityCityInput = this.querySelector(
          "[data-logo-text-url-input]",
        );
        this.nationalityCityCounter = this.querySelector(
          "[data-nationality-counter]",
        );

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

        this.updateFeaturePrices();

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
        this.updateFeaturePrices = () => {
          const currency = window.Shopify?.currency?.active || "SEK";
          const format = (cents) => {
            if (window.Shopify?.formatMoney) {
              try {
                const formatted = window.Shopify.formatMoney(cents);
                if (formatted && formatted !== `${cents}`) return formatted;
              } catch(e){}
            }
            return new Intl.NumberFormat(document.documentElement.lang || 'sv-SE', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: cents % 100 === 0 ? 0 : 2
            }).format(cents / 100);
          };

          const resolvePrice = (attrName, spanSelector) => {
            const fromAttr = parseFloat(this.getAttribute(attrName) || "0");
            if (fromAttr > 0) return fromAttr;
            const span = this.querySelector(spanSelector);
            const fromSpan = span ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0") : 0;
            return fromSpan * 100;
          };

          const nationalityPriceCents = resolvePrice('data-nationality-price', '[data-nationality-price]');
          const nameNumPriceCents = resolvePrice('data-name-price', '[data-name-number-price]');
          const logoPriceCents = resolvePrice('data-logo-price', '[data-logo-price]');

          const nationalityPriceSpan = this.querySelector("[data-nationality-price]");
          if (nationalityPriceSpan && nationalityPriceCents > 0) {
            nationalityPriceSpan.innerHTML = `+${format(nationalityPriceCents)}`;
          }

          const nameNumPriceSpan = this.querySelector("[data-name-number-price]");
          if (nameNumPriceSpan && nameNumPriceCents > 0) {
            nameNumPriceSpan.innerHTML = `+${format(nameNumPriceCents)}`;
          }

          const logoPriceSpan = this.querySelector("[data-logo-price]");
          if (logoPriceSpan && logoPriceCents > 0) {
            logoPriceSpan.innerHTML = `+${format(logoPriceCents)}`;
          }
        };

        this.updateExtraPriceSummary = () => {
          const wrapper = document.querySelector("[data-custom-total-price-wrapper]");
          if (!wrapper) return;

          let totalExtraPriceCents = 0;
          let hasExtra = false;

          const currency = window.Shopify?.currency?.active || "SEK";
          const format = (cents) => {
            if (window.Shopify?.formatMoney) {
              try {
                const formatted = window.Shopify.formatMoney(cents);
                if (formatted && formatted !== `${cents}`) return formatted;
              } catch(e){}
            }
            return new Intl.NumberFormat(document.documentElement.lang || 'sv-SE', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: cents % 100 === 0 ? 0 : 2
            }).format(cents / 100);
          };

          // Helper to resolve price in cents: prefer metafield attr on element,
          // fall back to block-setting span attr (which stores currency units, multiply × 100)
          const resolvePrice = (attrName, spanSelector) => {
            const fromAttr = parseFloat(this.getAttribute(attrName) || "0");
            if (fromAttr > 0) return fromAttr;
            const span = this.querySelector(spanSelector);
            const fromSpan = span ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0") : 0;
            return fromSpan * 100;
          };

          // Nationality
          const nationalityRow = wrapper.querySelector("[data-extra-nationality]");
          const nationalityDisplay = wrapper.querySelector("[data-nationality-price-display]");
          const nationalityPriceCents = resolvePrice('data-nationality-price', '[data-nationality-price]');

          if (this.nationalityCityInput && this.nationalityCityInput.value.trim() !== "" && nationalityPriceCents > 0) {
            totalExtraPriceCents += nationalityPriceCents;
            if (nationalityRow) nationalityRow.style.display = "flex";
            if (nationalityDisplay) nationalityDisplay.innerHTML = `+${format(nationalityPriceCents)}`;
            hasExtra = true;
          } else {
            if (nationalityRow) nationalityRow.style.display = "none";
          }

          // Logo
          const logoRow = wrapper.querySelector("[data-extra-logo]");
          const logoDisplay = wrapper.querySelector("[data-logo-price-display]");
          const logoPriceCents = resolvePrice('data-logo-price', '[data-logo-price]');
          const hasLogo = this.logoInput && this.logoInput.value.trim() !== "";

          if (hasLogo && logoPriceCents > 0) {
            totalExtraPriceCents += logoPriceCents;
            if (logoRow) logoRow.style.display = "flex";
            if (logoDisplay) logoDisplay.innerHTML = `+${format(logoPriceCents)}`;
            hasExtra = true;
          } else {
            if (logoRow) logoRow.style.display = "none";
          }

          // Name & Number
          const nameNumRow = wrapper.querySelector("[data-extra-name-number]");
          const nameNumDisplay = wrapper.querySelector("[data-name-number-price-display]");
          const nameNumPriceCents = resolvePrice('data-name-price', '[data-name-number-price]');
          const hasNameOrNum = (this.nameInput && this.nameInput.value.trim() !== "") || (this.numberInput && this.numberInput.value.trim() !== "");

          if (hasNameOrNum && nameNumPriceCents > 0) {
            totalExtraPriceCents += nameNumPriceCents;
            if (nameNumRow) nameNumRow.style.display = "flex";
            if (nameNumDisplay) nameNumDisplay.innerHTML = `+${format(nameNumPriceCents)}`;
            hasExtra = true;
          } else {
            if (nameNumRow) nameNumRow.style.display = "none";
          }

          // Gift Box
          const giftboxRow = wrapper.querySelector("[data-extra-giftbox]");
          const giftboxDisplay = wrapper.querySelector("[data-giftbox-price-display]");
          const productForm = document.querySelector('product-form[data-has-giftbox="true"]');
          const giftboxCheckbox = document.querySelector('input[name="giftbox_confirm"]');

          if (giftboxCheckbox && giftboxCheckbox.checked && productForm) {
            const giftboxPriceCents = parseFloat(productForm.getAttribute('data-giftbox-price') || "0");
            if (giftboxPriceCents > 0) {
              totalExtraPriceCents += giftboxPriceCents;
              if (giftboxRow) giftboxRow.style.display = "flex";
              if (giftboxDisplay) giftboxDisplay.innerHTML = `+${format(giftboxPriceCents)}`;
              hasExtra = true;
            }
          } else {
            if (giftboxRow) giftboxRow.style.display = "none";
          }

          const totalDisplay = wrapper.querySelector("[data-final-extra-price]");
          if (totalDisplay) {
            if (totalExtraPriceCents > 0) {
              totalDisplay.innerHTML = `+${format(totalExtraPriceCents)}`;
            }
          }

          if (hasExtra) {
            wrapper.style.display = "flex";
          } else {
            wrapper.style.display = "none";
          }

          // Update Return Policy Notice highlighting
          const returnPolicyNotice = document.querySelector(".personalization-return-policy");
          if (returnPolicyNotice) {
            if (hasExtra) {
              returnPolicyNotice.classList.add("is-active");
            } else {
              returnPolicyNotice.classList.remove("is-active");
            }
          }
          
          this.updatePriceBreakdown(totalExtraPriceCents);
        };

        if (this.nationalityCityInput) {
          this.nationalityCityInput.addEventListener("input", this.updateExtraPriceSummary);
        }
        if (this.nameInput) {
          this.nameInput.addEventListener("input", this.updateExtraPriceSummary);
        }
        if (this.numberInput) {
          this.numberInput.addEventListener("input", this.updateExtraPriceSummary);
        }

        // Listen to giftbox checkbox
        const giftboxCheckbox = document.querySelector('input[name="giftbox_confirm"]');
        if (giftboxCheckbox) {
          giftboxCheckbox.addEventListener("change", this.updateExtraPriceSummary);
        }

        // Initial check on load in case fields are pre-filled (e.g. going back from cart)
        setTimeout(() => {
          this.updateFeaturePrices();
          this.updateExtraPriceSummary();
        }, 100);


        this.countries = [

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
            // this.updateVariantOption(); removed
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
            // this.updateVariantOption(); removed
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
            // this.updateVariantOption(); removed
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
          this.clearCustomization();
        }, 100);

        // Clear customization on browser back button
        window.addEventListener("pageshow", (event) => {
          if (event.persisted) {
            this.clearCustomization();
          }
        });

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
        // this.updateVariantOption(); removed

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

        if (this.toggleBtn) {
          const icon = this.toggleBtn.querySelector(".customizer-accordion-icon");
          if (isHidden) {
            this.toggleBtn.classList.add("is-expanded");
            if (icon) icon.style.transform = "rotate(-180deg)";
          } else {
            this.toggleBtn.classList.remove("is-expanded");
            if (icon) icon.style.transform = "rotate(0deg)";
          }
        }

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
          this.toggleBtn.classList.toggle("is-expanded", !isHidden);
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
        
        // Remove active visual states from grid items
        const activeItems = this.querySelectorAll(".flag-item.is-active, .logo-item.is-active");
        activeItems.forEach(item => item.classList.remove("is-active"));

        this.updatePreview();
        this.updateClearButtons();
        this.updateExtraPriceSummary();
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
        // this.updateVariantOption(); removed
      }

      // updateVariantOption has been removed

      updateFeaturePrices() {
        const currency = window.Shopify?.currency?.active || "";
        const format = (cents) => {
          if (window.Shopify?.formatMoney) {
            return window.Shopify.formatMoney(cents);
          }
          return `${(cents / 100).toFixed(2)} ${currency}`;
        };

        const resolvePrice = (attrName, spanSelector) => {
          const fromAttr = parseFloat(this.getAttribute(attrName) || "0");
          if (fromAttr > 0) return fromAttr;
          const span = this.querySelector(spanSelector);
          return span ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0") * 100 : 0;
        };

        const nationalityPriceCents = resolvePrice('data-nationality-price', '[data-nationality-price]');
        const nameNumPriceCents = resolvePrice('data-name-price', '[data-name-number-price]');
        const logoPriceCents = resolvePrice('data-logo-price', '[data-logo-price]');

        const nationalityPriceSpan = this.querySelector("[data-nationality-price]");
        if (nationalityPriceSpan && nationalityPriceCents > 0) {
          nationalityPriceSpan.innerHTML = `+${format(nationalityPriceCents)}`;
        }

        const nameNumPriceSpan = this.querySelector("[data-name-number-price]");
        if (nameNumPriceSpan && nameNumPriceCents > 0) {
          nameNumPriceSpan.innerHTML = `+${format(nameNumPriceCents)}`;
        }

        const logoPriceSpan = this.querySelector("[data-logo-price]");
        if (logoPriceSpan && logoPriceCents > 0) {
          logoPriceSpan.innerHTML = `+${format(logoPriceCents)}`;
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
          setTimeout(() => {
            this.updateFeaturePrices();
            this.updateExtraPriceSummary();
          }, 50);
        });

        this.observer.observe(priceContainer, {
          childList: true,
          subtree: true,
        });
      }

      updatePriceBreakdown(totalExtraPriceCents) {
        this.priceLabel =
          this.querySelector('[id^="CustomPriceLabel-"]') ||
          document.querySelector('[id^="CustomPriceLabel-"]');
        if (!this.priceLabel) return;

        const currency = window.Shopify?.currency?.active || "";
        const format = (cents) => {
          if (window.Shopify?.formatMoney) {
            try {
              const formatted = window.Shopify.formatMoney(cents);
              if (formatted && formatted !== `${cents}`) return formatted;
            } catch(e){}
          }
          return new Intl.NumberFormat(document.documentElement.lang || 'sv-SE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: cents % 100 === 0 ? 0 : 2
          }).format(cents / 100);
        };

        let basePrice = 0;
        
        const section = this.closest('.shopify-section') || document;
        const productForm = section.querySelector('form[action="/cart/add"]') ||
          section.querySelector('form[action*="cart/add"]') ||
          section.querySelector('product-form form');
        
        if (productForm) {
            const variantIdInput = productForm.querySelector('[name="id"]');
            if (variantIdInput && this.productData && this.productData.variants) {
               const variantId = parseInt(variantIdInput.value);
               const variant = this.productData.variants.find(v => v.id === variantId);
               if (variant) basePrice = variant.price;
            }
        }
        
        if (!basePrice) {
            const variantSelects = section.querySelector('variant-selects') || section.querySelector('variant-radios');
            if (variantSelects && variantSelects.currentVariant) {
                basePrice = variantSelects.currentVariant.price;
            }
        }

        if (totalExtraPriceCents <= 0) {
          if (this.priceLabel) this.priceLabel.style.display = "none";
          
          if (basePrice > 0) {
            const formattedTotal = format(basePrice);
            const regularPriceEl = section.querySelector('.price__regular .price-item--regular');
            const salePriceEl = section.querySelector('.price__sale .price-item--sale');
            if (regularPriceEl) regularPriceEl.innerHTML = formattedTotal;
            if (salePriceEl) salePriceEl.innerHTML = formattedTotal;
          }
          return;
        }

        if (basePrice > 0) {
          const totalPrice = basePrice + totalExtraPriceCents;
          const formattedTotal = format(totalPrice);
          
          // Update main product prices dynamically
          const regularPriceEl = section.querySelector('.price__regular .price-item--regular');
          const salePriceEl = section.querySelector('.price__sale .price-item--sale');
          
          if (regularPriceEl) {
            regularPriceEl.innerHTML = formattedTotal;
          }
          if (salePriceEl) {
            salePriceEl.innerHTML = formattedTotal;
          }

          if (this.priceLabel) {
            this.priceLabel.innerHTML = `${format(basePrice)} + ${format(totalExtraPriceCents)} (Personalization)`;
            this.priceLabel.style.display = "block";
          }
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
