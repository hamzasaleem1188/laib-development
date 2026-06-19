if (!customElements.get("custom-shirt-customizer")) {
  customElements.define(
    "custom-shirt-customizer",
    class CustomShirtCustomizer extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        window.customGalleryUserInteracted = false;
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
        this.isMixedInventory =
          this.getAttribute("data-mixed-inventory") === "true";

        this.updateFeaturePrices();

        this.form =
          this.querySelector('form[data-type="add-to-cart-form"]') ||
          document.querySelector('form[data-type="add-to-cart-form"]');
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
              } catch (e) {}
            }
            return new Intl.NumberFormat(
              document.documentElement.lang || "sv-SE",
              {
                style: "currency",
                currency: currency,
                minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
              },
            ).format(cents / 100);
          };

          const resolvePrice = (attrName, spanSelector) => {
            const fromAttr = parseFloat(this.getAttribute(attrName) || "0");
            if (fromAttr > 0) return fromAttr;
            const span = this.querySelector(spanSelector);
            const fromSpan = span
              ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0")
              : 0;
            return fromSpan * 100;
          };

          const nationalityPriceCents = resolvePrice(
            "data-nationality-price",
            "[data-nationality-price]",
          );
          const nameNumPriceCents = resolvePrice(
            "data-name-price",
            "[data-name-number-price]",
          );
          const logoPriceCents = resolvePrice(
            "data-logo-price",
            "[data-logo-price]",
          );

          const nationalityPriceSpan = this.querySelector(
            "[data-nationality-price]",
          );
          if (nationalityPriceSpan && nationalityPriceCents > 0) {
            nationalityPriceSpan.innerHTML = `+${format(nationalityPriceCents)}`;
          }

          const nameNumPriceSpan = this.querySelector(
            "[data-name-number-price]",
          );
          if (nameNumPriceSpan && nameNumPriceCents > 0) {
            nameNumPriceSpan.innerHTML = `+${format(nameNumPriceCents)}`;
          }

          const logoPriceSpan = this.querySelector("[data-logo-price]");
          if (logoPriceSpan && logoPriceCents > 0) {
            logoPriceSpan.innerHTML = `+${format(logoPriceCents)}`;
          }

          const gbCard = document.getElementById("Card-Giftbox");
          const gbPriceDiv = this.querySelector("[data-giftbox-price]");
          if (gbPriceDiv) {
            let gbCents = gbCard
              ? parseFloat(gbCard.getAttribute("data-giftbox-unit") || "0")
              : 0;
            if (!gbCents) {
              const pf = document.querySelector("product-form");
              gbCents = pf
                ? parseFloat(pf.getAttribute("data-giftbox-price") || "0") || 0
                : 0;
              if (gbCents && gbCard)
                gbCard.setAttribute("data-giftbox-unit", gbCents);
            }
            if (gbCents > 0) gbPriceDiv.innerHTML = `+${format(gbCents)}`;
          }
        };

        this.setupCustomPDP = () => {
          const updateCustomPDPSummaryAndCheckmarks = () => {
            const currency = window.Shopify?.currency?.active || "SEK";
            const format = (cents) => {
              if (window.Shopify?.formatMoney) {
                try {
                  const formatted = window.Shopify.formatMoney(cents);
                  if (formatted && formatted !== `${cents}`) return formatted;
                } catch (e) {}
              }
              return new Intl.NumberFormat(
                document.documentElement.lang || "sv-SE",
                {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
                },
              ).format(cents / 100);
            };

            const resolvePrice = (attrName) =>
              parseFloat(this.getAttribute(attrName) || "0");

            let actualVariantPrice = 0;
            const productForm =
              document.querySelector('form[action="/cart/add"]') ||
              document.querySelector('form[action*="cart/add"]') ||
              document.querySelector("product-form form");
            if (productForm && this.productData && this.productData.variants) {
              const variantIdInput = productForm.querySelector('[name="id"]');
              if (variantIdInput) {
                const variantId = parseInt(variantIdInput.value);
                const variant = this.productData.variants.find(
                  (v) => v.id === variantId,
                );
                if (variant) actualVariantPrice = variant.price;
              }
            }
            if (!actualVariantPrice) {
              const basePriceEl = document.querySelector(
                ".custom-pdp-price .price-item--regular",
              );
              const basePriceStr = basePriceEl
                ? basePriceEl.textContent
                    .replace(/[^0-9.,]/g, "")
                    .replace(",", ".")
                : "0";
              actualVariantPrice = parseFloat(basePriceStr) * 100 || 0;
              if (isNaN(actualVariantPrice)) actualVariantPrice = 0;
            }

            let totalPrice = actualVariantPrice;
            let displayBasePrice = actualVariantPrice;
            let dynamicLogoPriceCents = resolvePrice("data-logo-price");

            if (this.isBestSellingVariant) {
              const currentOptions = this.getCurrentOptions();
              if (
                currentOptions &&
                this.productData &&
                this.productData.variants
              ) {
                const baseVariant = this.productData.variants.find((v) => {
                  let isBase = false;
                  let countryOptIndex = -1;
                  v.options.forEach((opt, i) => {
                    if (
                      typeof opt === "string" &&
                      (opt === "-" ||
                        opt === " " ||
                        opt.toLowerCase() === "base" ||
                        opt.toLowerCase() === "blank")
                    ) {
                      isBase = true;
                      countryOptIndex = i;
                    }
                  });
                  if (!isBase) return false;

                  return v.options.every((opt, i) => {
                    if (i === countryOptIndex) return true;
                    if (currentOptions[i] && currentOptions[i] !== "") {
                      return (
                        opt.toLowerCase().trim() ===
                        currentOptions[i].toLowerCase().trim()
                      );
                    }
                    return true;
                  });
                });

                if (baseVariant && baseVariant.price) {
                  displayBasePrice = baseVariant.price;
                  dynamicLogoPriceCents =
                    actualVariantPrice - baseVariant.price;
                  if (dynamicLogoPriceCents < 0) dynamicLogoPriceCents = 0;
                }
              }
            }

            const updateRow = (
              id,
              name,
              priceCents,
              shouldAddToTotal = true,
            ) => {
              const row = document.getElementById(`SummaryRow-${id}`);
              const nameSpan = document.getElementById(
                `SummaryValue-${id}Name`,
              );
              const priceSpan = document.getElementById(
                `SummaryValue-${id}Price`,
              );
              const checkmark = document.getElementById(`Checkmark-${id}`);
              const card = document.getElementById(`Card-${id}`);

              if (name) {
                if (shouldAddToTotal) totalPrice += priceCents;
                if (row) row.style.display = "flex";
                if (nameSpan) nameSpan.textContent = name;
                if (priceSpan) priceSpan.textContent = `+${format(priceCents)}`;
                if (checkmark) checkmark.classList.add("is-visible");
                if (card) card.classList.add("is-active");
              } else {
                if (row) row.style.display = "none";
                if (checkmark) checkmark.classList.remove("is-visible");
                if (card) card.classList.remove("is-active");
              }
            };

            // Logo (Nationality Icon)
            const logoVal = this.logoInput ? this.logoInput.value.trim() : "";
            const isPrePrinted = this.isBestSellingVariant;

            if (logoVal) {
              if (isPrePrinted) {
                // Variant price already includes the logo, so we don't add to totalPrice (it's already in actualVariantPrice)
                // But we SHOW the dynamic logo price in the breakdown.
                updateRow(
                  "IdentityBadge",
                  logoVal,
                  dynamicLogoPriceCents,
                  false,
                );
              } else {
                updateRow(
                  "IdentityBadge",
                  logoVal,
                  dynamicLogoPriceCents,
                  true,
                ); // Add to totalPrice
              }
            } else {
              updateRow("IdentityBadge", "", 0, false);
            }

            // The base price is updated via the timeout now
            // const summaryBasePrice = document.getElementById('Summary-BasePrice');
            // if (summaryBasePrice) summaryBasePrice.textContent = format(displayBasePrice);

            // Front Text
            const textVal = this.nationalityCityInput
              ? this.nationalityCityInput.value.trim()
              : "";
            updateRow(
              "FrontText",
              textVal,
              resolvePrice("data-nationality-price"),
              true,
            );

            // Name & Number — activates when either field has a value
            const nameVal = this.nameInput ? this.nameInput.value.trim() : "";
            const numVal = this.numberInput
              ? this.numberInput.value.trim()
              : "";
            const combinedNameNum =
              nameVal && numVal ? `${nameVal} ${numVal}` : nameVal || numVal;
            updateRow(
              "NameNumber",
              combinedNameNum,
              resolvePrice("data-name-price"),
              true,
            );

            // Giftbox
            const gbRow = document.getElementById("SummaryRow-Giftbox");
            const gbCheckmark = document.getElementById("Checkmark-Giftbox");
            const gbCard = document.getElementById("Card-Giftbox");
            const gbCheckbox = document.getElementById("GiftboxCheckbox");
            const gbChecked = gbCheckbox ? gbCheckbox.checked : false;
            let gbUnitCents = gbCard
              ? parseFloat(gbCard.getAttribute("data-giftbox-unit")) || 0
              : 0;
            if (!gbUnitCents) {
              const pf = document.querySelector("product-form");
              gbUnitCents = pf
                ? parseFloat(pf.getAttribute("data-giftbox-price") || "0") || 0
                : 0;
              if (gbUnitCents && gbCard)
                gbCard.setAttribute("data-giftbox-unit", gbUnitCents);
            }

            if (gbChecked) {
              totalPrice += gbUnitCents;
              if (gbRow) {
                gbRow.style.display = "flex";
                const gbPriceSpan = document.getElementById(
                  "SummaryValue-GiftboxPrice",
                );
                if (gbPriceSpan)
                  gbPriceSpan.textContent = `+${format(gbUnitCents)}`;
              }
              if (gbCheckmark) gbCheckmark.classList.add("is-visible");
              if (gbCard) gbCard.classList.add("is-active");
            } else {
              if (gbCheckmark) gbCheckmark.classList.remove("is-visible");
              if (gbCard) gbCard.classList.remove("is-active");
            }

            // Show artificial calculation loader
            const extraPrice = totalPrice - displayBasePrice;
            const extraRow = document.getElementById("SummaryRow-ExtraPrice");
            const extraPriceVal = document.getElementById(
              "SummaryValue-ExtraPrice",
            );
            const totalDisplay = document.getElementById("Summary-TotalPrice");
            const baseDisplay = document.getElementById("Summary-BasePrice");

            const loaderHTML =
              '<span class="price-calculating-loader"><span></span><span></span><span></span></span>';

            if (extraPrice > 0) {
              if (extraRow) extraRow.style.display = "flex";
              if (extraPriceVal) extraPriceVal.innerHTML = loaderHTML;
            } else {
              if (extraRow) extraRow.style.display = "none";
            }
            if (totalDisplay) totalDisplay.innerHTML = loaderHTML;
            if (baseDisplay) baseDisplay.innerHTML = loaderHTML;

            // Clear previous timeout
            if (this.calcTimeout) clearTimeout(this.calcTimeout);

            this.calcTimeout = setTimeout(() => {
              if (baseDisplay)
                baseDisplay.textContent = format(displayBasePrice);
              if (extraPrice > 0 && extraPriceVal) {
                extraPriceVal.textContent = `+${format(extraPrice)}`;
              }
              if (totalDisplay) totalDisplay.textContent = format(totalPrice);
            }, 450); // 450ms artificial calculating delay
          };
          this._updateCustomPDPSummary = updateCustomPDPSummaryAndCheckmarks;

          // Bind updates
          if (this.logoInput) {
            const observer = new MutationObserver(() =>
              updateCustomPDPSummaryAndCheckmarks(),
            );
            observer.observe(this.logoInput, {
              attributes: true,
              attributeFilter: ["value"],
            });
          }
          const pdpScrollFront = this.debounce(() => {
            if (window.switchMedia) window.switchMedia("front");
            if (window.innerWidth < 1024) this.scrollToPreview();
          }, 800);
          const pdpScrollBack = this.debounce(() => {
            if (window.switchMedia) window.switchMedia("back");
            if (window.innerWidth < 1024) this.scrollToPreview();
          }, 800);

          if (this.nationalityCityInput) {
            this.nationalityCityInput.addEventListener("input", () => {
              const clean = this.nationalityCityInput.value.replace(
                /[0-9]/g,
                "",
              );
              if (this.nationalityCityInput.value !== clean)
                this.nationalityCityInput.value = clean;
              updateCustomPDPSummaryAndCheckmarks();
              if (clean.trim()) pdpScrollFront();
            });
          }
          if (this.nameInput) {
            this.nameInput.addEventListener("input", () => {
              const clean = this.nameInput.value.replace(/[0-9]/g, "");
              if (this.nameInput.value !== clean) this.nameInput.value = clean;
              updateCustomPDPSummaryAndCheckmarks();
              if (clean.trim()) pdpScrollBack();
            });
          }
          if (this.numberInput) {
            this.numberInput.addEventListener("input", () => {
              const clean = this.numberInput.value.replace(/[^0-9]/g, "");
              if (this.numberInput.value !== clean)
                this.numberInput.value = clean;
              updateCustomPDPSummaryAndCheckmarks();
              if (clean.trim()) pdpScrollBack();
            });
          }

          // Giftbox checkbox → syncs to product-form's giftbox_confirm input
          const gbCheckbox = document.getElementById("GiftboxCheckbox");

          const syncGiftbox = () => {
            const checked = gbCheckbox ? gbCheckbox.checked : false;
            // Query fresh each time — avoids stale reference if DOM re-renders
            const realGiftbox = document.querySelector(
              'product-form input[name="giftbox_confirm"]',
            );
            if (realGiftbox) {
              realGiftbox.checked = checked;
              realGiftbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
            updateCustomPDPSummaryAndCheckmarks();
          };

          if (gbCheckbox) gbCheckbox.addEventListener("change", syncGiftbox);
          this._resetGiftbox = () => {
            if (gbCheckbox) {
              gbCheckbox.checked = false;
              syncGiftbox();
            }
          };

          // Note: the Size/Color picker is the native theme variant-selects, and the
          // media gallery (Front/Back toggle, thumbnails, zoom) is self-contained in
          // custom-pdp-media-gallery.liquid — both work without JS here.

          // Recompute the summary when the variant price changes (product-info.js rerenders #price-*)
          const pdpPriceEl = document.querySelector(".custom-pdp-price");
          if (pdpPriceEl) {
            const priceObserver = new MutationObserver(() =>
              updateCustomPDPSummaryAndCheckmarks(),
            );
            priceObserver.observe(pdpPriceEl, {
              childList: true,
              subtree: true,
              characterData: true,
            });
          }

          // Initial sync
          setTimeout(updateCustomPDPSummaryAndCheckmarks, 100);
        };

        if (this.classList.contains("custom-pdp-customizer")) {
          this.setupCustomPDP();
        }

        this.updateExtraPriceSummary = () => {
          // The custom PDP layout has its own summary/total logic and must not
          // let the legacy breakdown rewrite the main price (it would double-count).
          if (this.classList.contains("custom-pdp-customizer")) {
            if (this._updateCustomPDPSummary) this._updateCustomPDPSummary();
            return;
          }
          const wrapper = document.querySelector(
            "[data-custom-total-price-wrapper]",
          );
          if (!wrapper) return;

          let totalExtraPriceCents = 0;
          let hasExtra = false;

          const currency = window.Shopify?.currency?.active || "SEK";
          const format = (cents) => {
            if (window.Shopify?.formatMoney) {
              try {
                const formatted = window.Shopify.formatMoney(cents);
                if (formatted && formatted !== `${cents}`) return formatted;
              } catch (e) {}
            }
            return new Intl.NumberFormat(
              document.documentElement.lang || "sv-SE",
              {
                style: "currency",
                currency: currency,
                minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
              },
            ).format(cents / 100);
          };

          // Helper to resolve price in cents: prefer metafield attr on element,
          // fall back to block-setting span attr (which stores currency units, multiply × 100)
          const resolvePrice = (attrName, spanSelector) => {
            const fromAttr = parseFloat(this.getAttribute(attrName) || "0");
            if (fromAttr > 0) return fromAttr;
            const span = this.querySelector(spanSelector);
            const fromSpan = span
              ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0")
              : 0;
            return fromSpan * 100;
          };

          // Nationality
          const nationalityRow = wrapper.querySelector(
            "[data-extra-nationality]",
          );
          const nationalityDisplay = wrapper.querySelector(
            "[data-nationality-price-display]",
          );
          const nationalityPriceCents = resolvePrice(
            "data-nationality-price",
            "[data-nationality-price]",
          );

          if (
            this.nationalityCityInput &&
            this.nationalityCityInput.value.trim() !== "" &&
            nationalityPriceCents > 0
          ) {
            totalExtraPriceCents += nationalityPriceCents;
            if (nationalityRow) nationalityRow.style.display = "flex";
            if (nationalityDisplay)
              nationalityDisplay.innerHTML = `+${format(nationalityPriceCents)}`;
            hasExtra = true;
          } else {
            if (nationalityRow) nationalityRow.style.display = "none";
          }

          // Logo
          const logoRow = wrapper.querySelector("[data-extra-logo]");
          const logoDisplay = wrapper.querySelector(
            "[data-logo-price-display]",
          );
          const logoPriceCents = resolvePrice(
            "data-logo-price",
            "[data-logo-price]",
          );
          const hasLogo = this.logoInput && this.logoInput.value.trim() !== "";
          const isLogoFree = this.hideLogoOverlay || this.isBestSellingVariant;

          if (hasLogo && logoPriceCents > 0 && !isLogoFree) {
            totalExtraPriceCents += logoPriceCents;
            if (logoRow) logoRow.style.display = "flex";
            if (logoDisplay)
              logoDisplay.innerHTML = `+${format(logoPriceCents)}`;
            hasExtra = true;
          } else {
            if (logoRow) logoRow.style.display = "none";
          }

          // Name & Number
          const nameNumRow = wrapper.querySelector("[data-extra-name-number]");
          const nameNumDisplay = wrapper.querySelector(
            "[data-name-number-price-display]",
          );
          const nameNumPriceCents = resolvePrice(
            "data-name-price",
            "[data-name-number-price]",
          );
          const hasNameOrNum =
            (this.nameInput && this.nameInput.value.trim() !== "") ||
            (this.numberInput && this.numberInput.value.trim() !== "");

          if (hasNameOrNum && nameNumPriceCents > 0) {
            totalExtraPriceCents += nameNumPriceCents;
            if (nameNumRow) nameNumRow.style.display = "flex";
            if (nameNumDisplay)
              nameNumDisplay.innerHTML = `+${format(nameNumPriceCents)}`;
            hasExtra = true;
          } else {
            if (nameNumRow) nameNumRow.style.display = "none";
          }

          // Gift Box
          const giftboxRow =
            this.querySelector("[data-extra-giftbox]") ||
            document.querySelector("[data-extra-giftbox]");
          const giftboxDisplay = wrapper.querySelector(
            "[data-giftbox-price-display]",
          );
          const productForm = document.querySelector(
            'product-form[data-has-giftbox="true"]',
          );
          const giftboxCheckbox = document.querySelector(
            'input[name="giftbox_confirm"]',
          );

          if (giftboxCheckbox && giftboxCheckbox.checked && productForm) {
            const giftboxPriceCents = parseFloat(
              productForm.getAttribute("data-giftbox-price") || "0",
            );
            if (giftboxPriceCents > 0) {
              totalExtraPriceCents += giftboxPriceCents;
              if (giftboxRow) giftboxRow.style.display = "flex";
              if (giftboxDisplay)
                giftboxDisplay.innerHTML = `+${format(giftboxPriceCents)}`;
              hasExtra = true;
            }
          } else {
            if (giftboxRow) giftboxRow.style.display = "none";
          }

          const totalDisplay = wrapper.querySelector(
            "[data-final-extra-price]",
          );
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
          const returnPolicyNotice = document.querySelector(
            ".personalization-return-policy",
          );
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
          this.nationalityCityInput.addEventListener(
            "input",
            this.updateExtraPriceSummary,
          );
        }
        if (this.nameInput) {
          this.nameInput.addEventListener(
            "input",
            this.updateExtraPriceSummary,
          );
        }
        if (this.numberInput) {
          this.numberInput.addEventListener(
            "input",
            this.updateExtraPriceSummary,
          );
        }

        // Listen to giftbox checkbox
        const giftboxCheckbox = document.querySelector(
          'input[name="giftbox_confirm"]',
        );
        if (giftboxCheckbox) {
          giftboxCheckbox.addEventListener(
            "change",
            this.updateExtraPriceSummary,
          );
        }

        // Initial check on load in case fields are pre-filled (e.g. going back from cart)
        setTimeout(() => {
          this.updateFeaturePrices();
          this.updateExtraPriceSummary();
        }, 100);

        if (this.toggleBtn)
          this.toggleBtn.addEventListener(
            "click",
            this.toggleDrawer.bind(this),
          );
        if (this.closeBtn)
          this.closeBtn.addEventListener("click", this.toggleDrawer.bind(this));

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
            if (e.isTrusted) window.customGalleryUserInteracted = true;

            const val = item.getAttribute("data-value");
            const url = item.getAttribute("data-logo-url");
            const labelUrl = item.getAttribute("data-label-url");
            const isBestSelling =
              item.getAttribute("data-is-best-selling") === "true";
            const span = item.querySelector("span");
            const labelText = span ? span.innerText.trim() : val;

            this.handleNationalityVariantSwitch(val, isBestSelling);

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

            // Update card icon with selected logo using same colorize technique as preview
            const iconPreview = document.getElementById(
              "IdentityBadgeIconPreview",
            );
            const iconSvg = document.getElementById("IdentityBadgeIconSvg");
            if (iconPreview) {
              if (url) {
                // Transparent pixel src + CSS mask = logo shape rendered in --print-color
                iconPreview.src =
                  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                iconPreview.classList.add("colorize-logo");
                iconPreview.style.webkitMaskImage = `url('${url}')`;
                iconPreview.style.maskImage = `url('${url}')`;
                iconPreview.style.display = "block";
                if (iconSvg) iconSvg.style.display = "none";
              } else {
                iconPreview.classList.remove("colorize-logo");
                iconPreview.style.webkitMaskImage = "";
                iconPreview.style.maskImage = "";
                iconPreview.style.display = "none";
                if (iconSvg) iconSvg.style.display = "";
              }
            }
            // this.updateVariantOption(); removed
            this.updateClearButtons();
            if (this.validationActive) {
              this.validateCustomization();
            } else if (this.errorLogo) {
              this.errorLogo.style.display = "none";
            }

            if (window.innerWidth < 1024) {
              if (window.switchMedia) window.switchMedia("front");
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
            window.customGalleryUserInteracted = true;
            this.clearCustomization();
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
          this.closeLogoDropdown();
        });

        this.setupPriceObserver();

        // Initial setup and inventory sync.
        // Fetch live variant availability from Shopify's products API to patch
        // the page-embedded productData (which may be stale due to CDN caching).
        setTimeout(() => {
          this.clearCustomization();

          if (this.productData && this.productData.handle) {
            fetch(`/products/${this.productData.handle}.js`)
              .then((r) => r.json())
              .then((freshData) => {
                if (freshData && freshData.variants) {
                  this.productData.variants = this.productData.variants.map(
                    (sv) => {
                      const fv = freshData.variants.find((v) => v.id === sv.id);
                      return fv
                        ? Object.assign({}, sv, { available: fv.available })
                        : sv;
                    },
                  );
                }
                this.updateInventoryState();
              })
              .catch(() => this.updateInventoryState());
          } else {
            this.updateInventoryState();
          }
        }, 100);

        // Track when variant changes to update inventory states
        const variantForm =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (variantForm) {
          variantForm.addEventListener("change", () => {
            setTimeout(() => {
              this.updateInventoryState();
            }, 50);
          });
        }

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

      getCurrentOptions() {
        const section = this.closest(".shopify-section") || document;
        return this.productData.options.map((optName) => {
          if (
            optName.toLowerCase().includes("nationality") ||
            optName.toLowerCase().includes("country") ||
            optName.toLowerCase().includes("logo") ||
            optName.toLowerCase().includes("flag")
          ) {
            return null;
          }
          let uiValue = "";
          const select =
            section.querySelector(
              `variant-selects select[name="options[${optName}]"]`,
            ) || section.querySelector(`select[name^="${optName}"]`);
          if (select) {
            uiValue = select.value;
          } else {
            const checkedInput =
              section.querySelector(
                `variant-radios input[name="${optName}"]:checked`,
              ) ||
              section.querySelector(
                `variant-selects input[name="${optName}"]:checked`,
              ) ||
              section.querySelector(`input[name^="${optName}"]:checked`) ||
              section.querySelector(
                `input[data-option-name="${optName}"]:checked`,
              );
            if (checkedInput) uiValue = checkedInput.value;
          }
          return uiValue;
        });
      }

      handleNationalityVariantSwitch(nationalityName, isBestSelling) {
        if (!this.productData || !this.productData.variants) return;

        let targetVariant = null;
        const currentOptions = this.getCurrentOptions();

        const matchVariant = (countryPredicate) => {
          return this.productData.variants.find((v) => {
            let countryMatches = false;
            let countryOptIndex = -1;

            // First pass: identify which option matches the country
            v.options.forEach((opt, i) => {
              if (countryPredicate(opt)) {
                countryMatches = true;
                countryOptIndex = i;
              }
            });

            if (!countryMatches) return false;

            // Second pass: ensure all other options match the currently selected UI options
            const matchesSelected = v.options.every((opt, i) => {
              if (i === countryOptIndex) return true; // We already matched the country here

              if (
                currentOptions &&
                currentOptions[i] &&
                currentOptions[i] !== ""
              ) {
                return (
                  opt.toLowerCase().trim() ===
                  currentOptions[i].toLowerCase().trim()
                );
              }
              return true;
            });

            return matchesSelected;
          });
        };

        if (isBestSelling) {
          targetVariant = matchVariant(
            (opt) =>
              typeof opt === "string" &&
              (opt.toLowerCase().trim() ===
                nationalityName.toLowerCase().trim() ||
                opt
                  .toLowerCase()
                  .trim()
                  .includes(nationalityName.toLowerCase().trim()) ||
                nationalityName
                  .toLowerCase()
                  .trim()
                  .includes(opt.toLowerCase().trim())),
          );
        }

        if (!targetVariant) {
          targetVariant = matchVariant(
            (opt) =>
              typeof opt === "string" &&
              (opt === "-" ||
                opt === " " ||
                opt.toLowerCase() === "base" ||
                opt.toLowerCase() === "blank"),
          );
          isBestSelling = false;
        }

        if (!targetVariant) {
          // Absolute fallback if strict matching fails
          if (isBestSelling) {
            targetVariant = this.productData.variants.find((v) =>
              v.options.some(
                (opt) =>
                  typeof opt === "string" &&
                  (opt.toLowerCase().trim() ===
                    nationalityName.toLowerCase().trim() ||
                    opt
                      .toLowerCase()
                      .trim()
                      .includes(nationalityName.toLowerCase().trim()) ||
                    nationalityName
                      .toLowerCase()
                      .trim()
                      .includes(opt.toLowerCase().trim())),
              ),
            );
          }
          if (!targetVariant) {
            targetVariant = this.productData.variants.find((v) =>
              v.options.some(
                (opt) =>
                  typeof opt === "string" &&
                  (opt === "-" ||
                    opt === " " ||
                    opt.toLowerCase() === "base" ||
                    opt.toLowerCase() === "blank"),
              ),
            );
            isBestSelling = false;
          }
        }

        // Force logo overlay to always show for now, because back images are missing
        this.hideLogoOverlay = false;
        this.isBestSellingVariant = isBestSelling;

        // Always add Country/Logo URL properties even if the logo is pre-printed on the variant
        if (this.logoInput) {
          this.logoInput.disabled = false;
        }
        if (this.logoUrlInput) {
          this.logoUrlInput.disabled = false;
        }

        if (targetVariant) {
          let lastElement = null;
          let changed = false;

          targetVariant.options.forEach((optValue, index) => {
            const optionName = this.productData.options[index];
            const escapedOptValue = optValue.replace(/"/g, '\\"');
            const position = index + 1;
            const radioName = `${optionName}-${position}`;
            const section = this.closest(".shopify-section") || document;
            const radio =
              section.querySelector(
                `variant-radios input[type="radio"][name="${radioName}"][value="${escapedOptValue}"]`,
              ) ||
              section.querySelector(
                `variant-selects input[type="radio"][name="${radioName}"][value="${escapedOptValue}"]`,
              ) ||
              section.querySelector(
                `input[type="radio"][name="${radioName}"][value="${escapedOptValue}"]`,
              ) ||
              section.querySelector(
                `input[type="radio"][value="${escapedOptValue}"]`,
              );

            if (radio) {
              if (!radio.checked) {
                radio.checked = true;
                lastElement = radio;
                changed = true;
              }
            } else {
              const selectName = `options[${optionName}]`;
              const select =
                section.querySelector(
                  `variant-selects select[name="${selectName}"]`,
                ) ||
                section.querySelector(`select[name="${selectName}"]`) ||
                section.querySelector(`select[name="${radioName}"]`) ||
                section.querySelector(`select[name="options[${optionName}]"]`);
              if (select && select.value !== optValue) {
                select.value = optValue;
                lastElement = select;
                changed = true;
              }
            }
          });

          if (changed && lastElement) {
            lastElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }

        // Dynamically update Gallery Front/Back index if customMediaData exists
        if (window.customMediaData) {
          const normalizeText = (text) => {
            if (!text) return "";
            return text
              .toLowerCase()
              .replace(/&amp;/g, "&")
              .replace(/\s+/g, " ")
              .trim();
          };

          const selectedCountryLower = isBestSelling
            ? normalizeText(nationalityName)
            : "base";
          console.log("selectedCountryLower:", selectedCountryLower);
          console.log(
            "customMediaData available, length:",
            window.customMediaData.length,
          );

          let newFront = window.customMediaData.find((m) => {
            const alt = normalizeText(m.alt);
            return alt.includes(selectedCountryLower) && alt.includes("front");
          });
          let newBack = window.customMediaData.find((m) => {
            const alt = normalizeText(m.alt);
            return alt.includes(selectedCountryLower) && alt.includes("back");
          });

          if (!newFront)
            newFront = window.customMediaData.find((m) =>
              normalizeText(m.alt).includes("front"),
            ); // fallback
          if (!newBack)
            newBack = window.customMediaData.find((m) =>
              normalizeText(m.alt).includes("back"),
            ); // fallback

          if (newFront) window.customGalleryFrontIndex = newFront.index;
          if (newBack) window.customGalleryBackIndex = newBack.index;

          if (window.switchMedia) {
            window.switchMedia("front");
          }
        } else {
          console.log("===== customMediaData is missing from window!");
        }

        this.updateFeaturePrices();
      }

      updateLogoPreview(logoUrl, labelText) {
        let frontLogoUrl = logoUrl;
        let backLogoUrl = logoUrl;

        // If it's a pre-printed (best selling) variant, hide the front logo overlay
        // since the photo already has it. Keep it on the back since back photos aren't pre-printed.
        if (this.isBestSellingVariant) {
          frontLogoUrl = "";
        }

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
        if (frontFlag && frontLogoUrl) {
          frontFlag.src =
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
          frontFlag.classList.add("colorize-logo");
          frontFlag.style.webkitMaskImage = `url('${frontLogoUrl}')`;
          frontFlag.style.maskImage = `url('${frontLogoUrl}')`;
          if (frontContainer) frontContainer.style.display = "block";
        } else if (frontFlag) {
          frontFlag.classList.remove("colorize-logo");
          frontFlag.style.webkitMaskImage = "";
          frontFlag.style.maskImage = "";
          if (frontContainer) frontContainer.style.display = "none";
        }

        if (backFlag && backLogoUrl) {
          backFlag.src =
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
          backFlag.classList.add("colorize-logo");
          backFlag.style.webkitMaskImage = `url('${backLogoUrl}')`;
          backFlag.style.maskImage = `url('${backLogoUrl}')`;
          if (backContainer) backContainer.style.display = "block";
        } else if (backFlag) {
          backFlag.classList.remove("colorize-logo");
          backFlag.style.webkitMaskImage = "";
          backFlag.style.maskImage = "";
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
          const icon = this.toggleBtn.querySelector(
            ".customizer-accordion-icon",
          );
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

        // Reset Dawn variant to Base (only if base is available; if not, updateInventoryState handles best-selling fallback)
        if (this.productData && this.productData.variants) {
          const baseVariant = this.productData.variants.find(
            (v) =>
              v.options.includes("-") ||
              v.options.some(
                (opt) =>
                  typeof opt === "string" && opt.toLowerCase() === "base",
              ) ||
              v.options.some(
                (opt) =>
                  typeof opt === "string" && opt.toLowerCase() === "blank",
              ),
          );
          if (baseVariant && baseVariant.available !== false) {
            this.handleNationalityVariantSwitch("Base", false);
          }
        }

        // Remove active visual states from grid items
        const activeItems = this.querySelectorAll(
          ".flag-item.is-active, .logo-item.is-active",
        );
        activeItems.forEach((item) => item.classList.remove("is-active"));

        // Reset the giftbox stepper (custom PDP) back to 0
        if (this._resetGiftbox) this._resetGiftbox();

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
          return span
            ? parseFloat(span.getAttribute(spanSelector.slice(1, -1)) || "0") *
                100
            : 0;
        };

        const nationalityPriceCents = resolvePrice(
          "data-nationality-price",
          "[data-nationality-price]",
        );
        const nameNumPriceCents = resolvePrice(
          "data-name-price",
          "[data-name-number-price]",
        );
        const logoPriceCents = resolvePrice(
          "data-logo-price",
          "[data-logo-price]",
        );

        const nationalityPriceSpan = this.querySelector(
          "[data-nationality-price]",
        );
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

        const gbCard = document.getElementById("Card-Giftbox");
        const gbPriceDiv = this.querySelector("[data-giftbox-price]");
        if (gbPriceDiv) {
          let gbCents = gbCard
            ? parseFloat(gbCard.getAttribute("data-giftbox-unit") || "0")
            : 0;
          if (!gbCents) {
            const pf = document.querySelector("product-form");
            gbCents = pf
              ? parseFloat(pf.getAttribute("data-giftbox-price") || "0") || 0
              : 0;
            if (gbCents && gbCard)
              gbCard.setAttribute("data-giftbox-unit", gbCents);
          }
          if (gbCents > 0) gbPriceDiv.innerHTML = `+${format(gbCents)}`;
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
            } catch (e) {}
          }
          return new Intl.NumberFormat(
            document.documentElement.lang || "sv-SE",
            {
              style: "currency",
              currency: currency,
              minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
            },
          ).format(cents / 100);
        };

        let basePrice = 0;

        const section = this.closest(".shopify-section") || document;
        const productForm =
          section.querySelector('form[action="/cart/add"]') ||
          section.querySelector('form[action*="cart/add"]') ||
          section.querySelector("product-form form");

        if (productForm) {
          const variantIdInput = productForm.querySelector('[name="id"]');
          if (variantIdInput && this.productData && this.productData.variants) {
            const variantId = parseInt(variantIdInput.value);
            const variant = this.productData.variants.find(
              (v) => v.id === variantId,
            );
            if (variant) basePrice = variant.price;
          }
        }

        if (!basePrice) {
          const variantSelects =
            section.querySelector("variant-selects") ||
            section.querySelector("variant-radios");
          if (variantSelects && variantSelects.currentVariant) {
            basePrice = variantSelects.currentVariant.price;
          }
        }

        if (totalExtraPriceCents <= 0) {
          if (this.priceLabel) this.priceLabel.style.display = "none";

          if (basePrice > 0) {
            const formattedTotal = format(basePrice);
            const regularPriceEl = section.querySelector(
              ".price__regular .price-item--regular",
            );
            const salePriceEl = section.querySelector(
              ".price__sale .price-item--sale",
            );
            if (regularPriceEl) regularPriceEl.innerHTML = formattedTotal;
            if (salePriceEl) salePriceEl.innerHTML = formattedTotal;
          }
          return;
        }

        if (basePrice > 0) {
          const totalPrice = basePrice + totalExtraPriceCents;
          const formattedTotal = format(totalPrice);

          // Update main product prices dynamically
          const regularPriceEl = section.querySelector(
            ".price__regular .price-item--regular",
          );
          const salePriceEl = section.querySelector(
            ".price__sale .price-item--sale",
          );

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
        if (this.logoClearBtn) {
          this.logoClearBtn.style.display =
            this.logoInput && this.logoInput.value ? "flex" : "none";
        }
      }

      autoSelectDefaultVariant() {
        const variantJsonTag = document.querySelector(
          "script[data-selected-variant]",
        );
        if (!variantJsonTag) return;
        try {
          const defaultVariant = JSON.parse(variantJsonTag.textContent);
          if (!defaultVariant || !defaultVariant.options) return;

          const nationalityIndex = this.productData?.options?.findIndex(
            (o) =>
              o.toLowerCase().includes("nationality") ||
              o.toLowerCase().includes("country"),
          );

          if (nationalityIndex >= 0) {
            const defaultNationality = defaultVariant.options[nationalityIndex];
            if (
              defaultNationality &&
              defaultNationality.toLowerCase() !== "base"
            ) {
              if (this.logoList) {
                const items = this.logoList.querySelectorAll(".item");
                let foundItem = Array.from(items).find(
                  (item) =>
                    item.getAttribute("data-value") === defaultNationality,
                );
                if (foundItem) {
                  foundItem.click(); // This will select the logo and update image
                }
              }
            }
          }
        } catch (e) {
          console.error("Error parsing default variant", e);
        }
      }

      updateInventoryState() {
        if (!this.productData || !this.productData.variants) return;

        const container =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (!container) return;

        // Get currently selected options (ignoring Nationality/Country)
        const currentOptions = this.productData.options.map((optName) => {
          if (
            optName.toLowerCase().includes("nationality") ||
            optName.toLowerCase().includes("country")
          ) {
            return null; // We will test this one
          }
          let uiValue = "";
          const select =
            container.querySelector(`select[name="options[${optName}]"]`) ||
            container.querySelector(`select[name^="${optName}"]`);
          if (select) {
            uiValue = select.value;
          } else {
            const checkedInput =
              container.querySelector(
                `input[name="options[${optName}]"]:checked`,
              ) ||
              container.querySelector(`input[name^="${optName}"]:checked`) ||
              container.querySelector(
                `input[data-option-name="${optName}"]:checked`,
              );
            if (checkedInput) uiValue = checkedInput.value;
          }
          return uiValue;
        });

        // Test each logo item in the dropdown
        if (this.logoList) {
          const items = this.logoList.querySelectorAll(".item");
          let anyAvailable = false;
          let firstAvailableItem = null;

          items.forEach((item) => {
            const isBestSelling =
              item.getAttribute("data-is-best-selling") === "true";
            const val = item.getAttribute("data-value");

            if (isBestSelling) {
              const matchingVariant = this.productData.variants.find((v) => {
                return v.options.every((opt, i) => {
                  if (currentOptions[i] === null) {
                    return (
                      typeof opt === "string" &&
                      opt.toLowerCase() === val.toLowerCase()
                    );
                  }
                  return opt === currentOptions[i];
                });
              });

              if (!matchingVariant || !matchingVariant.available) {
                item.classList.add("is-disabled");
              } else {
                item.classList.remove("is-disabled");
                anyAvailable = true;
                if (!firstAvailableItem) firstAvailableItem = item;
              }
            } else {
              item.classList.remove("is-disabled");
            }
          });

          // Check if Base variant is available for current size/color
          const baseVariant = this.productData.variants.find((v) => {
            return v.options.every((opt, i) => {
              if (currentOptions[i] === null) {
                return (
                  typeof opt === "string" &&
                  (opt.toLowerCase() === "base" ||
                    opt.toLowerCase() === "blank" ||
                    opt === "-")
                );
              }
              return opt === currentOptions[i];
            });
          });

          const baseIsAvailable = baseVariant && baseVariant.available;

          // If base is NOT available, and user hasn't selected a logo, we should auto-select an available best-selling variant
          const hasLogo = this.logoInput && this.logoInput.value.trim() !== "";
          if (!baseIsAvailable && !hasLogo && firstAvailableItem) {
            firstAvailableItem.click(); // Auto-select best-selling to prevent confusion
          }

          // Check the fully assembled currently selected variant
          const fullCurrentOptions = this.productData.options.map((optName) => {
            let uiValue = "";
            const select =
              container.querySelector(`select[name="options[${optName}]"]`) ||
              container.querySelector(`select[name^="${optName}"]`);
            if (select) {
              uiValue = select.value;
            } else {
              const checkedInput =
                container.querySelector(
                  `input[name="options[${optName}]"]:checked`,
                ) ||
                container.querySelector(`input[name^="${optName}"]:checked`) ||
                container.querySelector(
                  `input[data-option-name="${optName}"]:checked`,
                );
              if (checkedInput) uiValue = checkedInput.value;
            }
            return uiValue;
          });

          const currentVariant = this.productData.variants.find((v) => {
            return v.options.every((opt, i) => opt === fullCurrentOptions[i]);
          });

          const isCurrentAvailable = currentVariant && currentVariant.available;

          // Hide Buy It Now button with animation natively
          const customBuyNowBtns = document.querySelectorAll(
            ".custom-buy-now-btn",
          );
          customBuyNowBtns.forEach((btn) => {
            if (!isCurrentAvailable) {
              btn.classList.add("is-hidden-animated");
              btn.disabled = true;
            } else {
              btn.classList.remove("is-hidden-animated");
              btn.disabled = false;
            }
          });
        }
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
