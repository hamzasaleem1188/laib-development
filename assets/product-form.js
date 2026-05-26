if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.variantIdInput.disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector("span");

        if (document.querySelector("cart-drawer"))
          this.submitButton.setAttribute("aria-haspopup", "dialog");

        this.hideErrors = this.dataset.hideErrors === "true";

        this.addEventListener(
          "click",
          (evt) => {
            const buyNowButton = evt.target.closest(".shopify-payment-button");
            if (buyNowButton) {
              const hasGiftbox =
                this.getAttribute("data-has-giftbox") === "true";
              if (hasGiftbox) {
                evt.preventDefault();
                evt.stopPropagation();
                this.handleFormSubmit(true);
              }
            }
          },
          true,
        ); // capturing phase to intercept Shopify listener

        const giftboxId = this.getAttribute("data-giftbox-id");
        if (giftboxId) {
          this.fetchGiftboxPrice(giftboxId);
        }
      }

      fetchGiftboxPrice(giftboxId) {
        const priceSpan = this.querySelector(".giftbox-checkbox-price");
        if (!priceSpan) return;

        fetch(
          `${window.routes.root_url || "/"}search?view=giftbox-ajax&q=${giftboxId}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.price_formatted) {
              priceSpan.textContent = `+${data.price_formatted}`;
              priceSpan.style.display = "inline-block";
            }
          })
          .catch((err) => {
            console.error("Failed to fetch gift box price:", err);
          });
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        this.handleFormSubmit(false);
      }

      handleFormSubmit(isBuyNow) {
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");
        this.querySelector(".loading__spinner").classList.remove("hidden");

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id),
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage =
                this.submitButton.querySelector(".sold-out-message");
              if (!soldOutMessage) return;
              this.submitButton.setAttribute("aria-disabled", true);
              this.submitButtonText.classList.add("hidden");
              soldOutMessage.classList.remove("hidden");
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: "product-form",
                productVariantId: formData.get("id"),
                cartData: response,
              });
            this.error = false;

            const hasGiftbox = this.getAttribute("data-has-giftbox") === "true";
            const giftboxId = this.getAttribute("data-giftbox-id");
            const sectionId = this.getAttribute("data-section-id");
            const giftboxModal = document.getElementById(
              `GiftBoxModal-${sectionId}`,
            );

            const checkboxEl = this.querySelector(
              'input[name="giftbox_confirm"]',
            );
            const isCheckboxChecked = checkboxEl ? checkboxEl.checked : false;

            if (hasGiftbox && giftboxId && giftboxModal) {
              this.showGiftBoxPopup(
                giftboxId,
                response,
                giftboxModal,
                isBuyNow,
                isCheckboxChecked,
              );
            } else {
              this.resetCheckbox();
              if (isBuyNow) {
                const checkoutUrl =
                  (window.routes.root_url || "").replace(/\/$/, "") +
                  "/checkout";
                window.location = checkoutUrl;
              } else {
                this.renderCartOrRedirect(response);
              }
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            if (!this.error) this.submitButton.removeAttribute("aria-disabled");
            this.querySelector(".loading__spinner").classList.add("hidden");
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message",
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute("disabled", "disabled");
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute("disabled");
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      renderCartOrRedirect(response) {
        const quickAddModal = this.closest("quick-add-modal");
        if (quickAddModal) {
          document.body.addEventListener(
            "modalClosed",
            () => {
              setTimeout(() => {
                this.cart.renderContents(response);
              });
            },
            { once: true },
          );
          quickAddModal.hide(true);
        } else {
          this.cart.renderContents(response);
        }
      }

      showGiftBoxPopup(
        giftboxId,
        cartResponse,
        modalEl,
        isBuyNow,
        isCheckboxChecked,
      ) {
        if (modalEl.parentNode !== document.body) {
          document.body.appendChild(modalEl);
        }

        const loadingEl = modalEl.querySelector(".giftbox-loading");
        const contentEl = modalEl.querySelector(".giftbox-content");

        loadingEl.style.display = "block";
        contentEl.style.display = "none";

        modalEl.classList.add("is-open");
        document.body.classList.add("modal-open");

        fetch(
          `${window.routes.root_url || "/"}search?view=giftbox-ajax&q=${giftboxId}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.error || !data.variants || data.variants.length === 0) {
              console.error("Gift box product search failed:", data.error);
              modalEl.classList.remove("is-open");
              document.body.classList.remove("modal-open");
              if (isBuyNow) {
                const checkoutUrl =
                  (window.routes.root_url || "").replace(/\/$/, "") +
                  "/checkout";
                window.location = checkoutUrl;
              } else {
                this.renderCartOrRedirect(cartResponse);
              }
              return;
            }

            const titleEl = modalEl.querySelector(".giftbox-title");
            if (titleEl) {
              titleEl.textContent = "Sending this as a gift? 🎁";
            }

            const productTitleEl = modalEl.querySelector(
              ".giftbox-product-title",
            );
            const priceEl = modalEl.querySelector(".giftbox-product-price");
            const imgEl = modalEl.querySelector(".giftbox-product-image");
            const addBtn = modalEl.querySelector(".giftbox-add-btn");
            const declineBtn = modalEl.querySelector(".giftbox-decline-btn");
            const closeBtn = modalEl.querySelector(".custom-modal__close");
            const overlayEl = modalEl.querySelector(".custom-modal__overlay");
            const noteInput = modalEl.querySelector(
              'input[name="giftbox_note"]',
            );
            const noteCounter = modalEl.querySelector(
              "#GiftBoxNoteCounter-" + this.getAttribute("data-section-id"),
            );

            productTitleEl.textContent = data.title;
            priceEl.textContent = data.price_formatted;

            if (data.featured_image) {
              let imgSrc = data.featured_image;
              if (imgSrc.startsWith("//")) {
                imgSrc = "https:" + imgSrc;
              }
              imgEl.src = imgSrc;
              imgEl.style.display = "block";
            } else {
              imgEl.style.display = "none";
            }

            if (noteInput) {
              noteInput.value = "";
              if (noteCounter) noteCounter.textContent = "0/30";
              noteInput.oninput = () => {
                if (noteCounter)
                  noteCounter.textContent = `${noteInput.value.length}/30`;
              };
            }

            loadingEl.style.display = "none";
            contentEl.style.display = "block";

            const giftVariant =
              data.variants.find((v) => v.available) || data.variants[0];
            const giftVariantId = giftVariant.id;

            addBtn.onclick = () => {
              addBtn.setAttribute("disabled", "disabled");
              addBtn.textContent = "Adding...";

              const properties = {};
              if (noteInput && noteInput.value.trim() !== "") {
                properties["Note"] = noteInput.value.trim();
              }

              const config = fetchConfig("javascript");
              config.headers["X-Requested-With"] = "XMLHttpRequest";
              delete config.headers["Content-Type"];

              const giftFormData = new FormData();
              giftFormData.append("id", giftVariantId);
              giftFormData.append("quantity", 1);
              for (const [key, value] of Object.entries(properties)) {
                giftFormData.append(`properties[${key}]`, value);
              }

              if (this.cart) {
                giftFormData.append(
                  "sections",
                  this.cart.getSectionsToRender().map((section) => section.id),
                );
                giftFormData.append("sections_url", window.location.pathname);
              }
              config.body = giftFormData;

              fetch(`${routes.cart_add_url}`, config)
                .then((res) => res.json())
                .then((finalResponse) => {
                  this.resetCheckbox();
                  publish(PUB_SUB_EVENTS.cartUpdate, {
                    source: "product-form",
                    productVariantId: giftVariantId,
                    cartData: finalResponse,
                  });
                  modalEl.classList.remove("is-open");
                  document.body.classList.remove("modal-open");
                  if (isBuyNow) {
                    const checkoutUrl =
                      (window.routes.root_url || "").replace(/\/$/, "") +
                      "/checkout";
                    window.location = checkoutUrl;
                  } else {
                    this.renderCartOrRedirect(finalResponse);
                  }
                })
                .catch((err) => {
                  console.error(err);
                  modalEl.classList.remove("is-open");
                  document.body.classList.remove("modal-open");
                  if (isBuyNow) {
                    const checkoutUrl =
                      (window.routes.root_url || "").replace(/\/$/, "") +
                      "/checkout";
                    window.location = checkoutUrl;
                  } else {
                    this.renderCartOrRedirect(cartResponse);
                  }
                });
            };

            const closeAndShowCart = (isDeclined = false) => {
              modalEl.classList.remove("is-open");
              document.body.classList.remove("modal-open");
              this.resetCheckbox();

              const shouldAddGiftbox = isCheckboxChecked && !isDeclined;

              if (shouldAddGiftbox) {
                this.addGiftboxOnly(giftVariantId, cartResponse, isBuyNow);
              } else {
                if (isBuyNow) {
                  const checkoutUrl =
                    (window.routes.root_url || "").replace(/\/$/, "") +
                    "/checkout";
                  window.location = checkoutUrl;
                } else {
                  this.renderCartOrRedirect(cartResponse);
                }
              }
            };

            declineBtn.onclick = () => closeAndShowCart(true);
            closeBtn.onclick = () => closeAndShowCart(false);
            overlayEl.onclick = () => closeAndShowCart(false);
          })
          .catch((err) => {
            console.error("Error fetching gift box product details:", err);
            modalEl.classList.remove("is-open");
            document.body.classList.remove("modal-open");
            if (isBuyNow) {
              const checkoutUrl =
                (window.routes.root_url || "").replace(/\/$/, "") + "/checkout";
              window.location = checkoutUrl;
            } else {
              this.renderCartOrRedirect(cartResponse);
            }
          });
      }

      addGiftboxOnly(giftVariantId, cartResponse, isBuyNow) {
        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const giftFormData = new FormData();
        giftFormData.append("id", giftVariantId);
        giftFormData.append("quantity", 1);

        if (this.cart) {
          giftFormData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id),
          );
          giftFormData.append("sections_url", window.location.pathname);
        }
        config.body = giftFormData;

        fetch(`${routes.cart_add_url}`, config)
          .then((res) => res.json())
          .then((finalResponse) => {
            this.resetCheckbox();
            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: "product-form",
              productVariantId: giftVariantId,
              cartData: finalResponse,
            });
            if (isBuyNow) {
              const checkoutUrl =
                (window.routes.root_url || "").replace(/\/$/, "") + "/checkout";
              window.location = checkoutUrl;
            } else {
              this.renderCartOrRedirect(finalResponse);
            }
          })
          .catch((err) => {
            console.error("Failed to add gift box automatically:", err);
            if (isBuyNow) {
              const checkoutUrl =
                (window.routes.root_url || "").replace(/\/$/, "") + "/checkout";
              window.location = checkoutUrl;
            } else {
              this.renderCartOrRedirect(cartResponse);
            }
          });
      }

      resetCheckbox() {
        const checkboxEl = this.querySelector('input[name="giftbox_confirm"]');
        if (checkboxEl) checkboxEl.checked = false;
      }

      get variantIdInput() {
        return this.form.querySelector("[name=id]");
      }
    },
  );
}
