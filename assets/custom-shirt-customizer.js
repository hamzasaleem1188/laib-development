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
        this.numberCounter = this.querySelector("[data-number-counter]");

        this.flagSelect = this.querySelector("[data-flag-select]");
        if (this.flagSelect) {
          this.flagSelected = this.flagSelect.querySelector(".select-selected");
          this.flagItems = this.flagSelect.querySelector(".select-items");
          this.flagSearch = this.flagSelect.querySelector("[data-flag-search]");
          this.flagList = this.flagSelect.querySelector("[data-flag-list]");
          this.flagInput = this.querySelector("[data-flag-input]");
          this.selectedName = this.flagSelect.querySelector("[data-selected-name]");
          this.dropdownClearBtn = this.flagSelect.querySelector("[data-dropdown-clear]");
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
        }

        this.priceLabel =
          this.querySelector('[id^="CustomPriceLabel-"]') ||
          document.querySelector('[id^="CustomPriceLabel-"]');
        const jsonScript =
          this.querySelector('[id^="ProductJSON-"]') ||
          document.querySelector('[id^="ProductJSON-"]');
        this.productData = jsonScript
          ? JSON.parse(jsonScript.textContent)
          : null;

        this.countries = [
          { name: "Afghanistan", code: "af" },
          { name: "Åland Islands", code: "ax" },
          { name: "Albania", code: "al" },
          { name: "Algeria", code: "dz" },
          { name: "American Samoa", code: "as" },
          { name: "Andorra", code: "ad" },
          { name: "Angola", code: "ao" },
          { name: "Anguilla", code: "ai" },
          { name: "Antarctica", code: "aq" },
          { name: "Antigua and Barbuda", code: "ag" },
          { name: "Argentina", code: "ar" },
          { name: "Armenia", code: "am" },
          { name: "Aruba", code: "aw" },
          { name: "Australia", code: "au" },
          { name: "Austria", code: "at" },
          { name: "Azerbaijan", code: "az" },
          { name: "Bahamas", code: "bs" },
          { name: "Bahrain", code: "bh" },
          { name: "Bangladesh", code: "bd" },
          { name: "Barbados", code: "bb" },
          { name: "Belarus", code: "by" },
          { name: "Belgium", code: "be" },
          { name: "Belize", code: "bz" },
          { name: "Benin", code: "bj" },
          { name: "Bermuda", code: "bm" },
          { name: "Bhutan", code: "bt" },
          { name: "Bolivia", code: "bo" },
          { name: "Bosnia and Herzegovina", code: "ba" },
          { name: "Botswana", code: "bw" },
          { name: "Bouvet Island", code: "bv" },
          { name: "Brazil", code: "br" },
          { name: "British Indian Ocean Territory", code: "io" },
          { name: "Brunei", code: "bn" },
          { name: "Bulgaria", code: "bg" },
          { name: "Burkina Faso", code: "bf" },
          { name: "Burundi", code: "bi" },
          { name: "Cambodia", code: "kh" },
          { name: "Cameroon", code: "cm" },
          { name: "Canada", code: "ca" },
          { name: "Cape Verde", code: "cv" },
          { name: "Caribbean Netherlands", code: "bq" },
          { name: "Cayman Islands", code: "ky" },
          { name: "Central African Republic", code: "cf" },
          { name: "Chad", code: "td" },
          { name: "Chile", code: "cl" },
          { name: "China", code: "cn" },
          { name: "Christmas Island", code: "cx" },
          { name: "Cocos Islands", code: "cc" },
          { name: "Colombia", code: "co" },
          { name: "Comoros", code: "km" },
          { name: "Congo", code: "cg" },
          { name: "Congo (Democratic Republic)", code: "cd" },
          { name: "Cook Islands", code: "ck" },
          { name: "Costa Rica", code: "cr" },
          { name: "Croatia", code: "hr" },
          { name: "Cuba", code: "cu" },
          { name: "Curaçao", code: "cw" },
          { name: "Cyprus", code: "cy" },
          { name: "Czechia", code: "cz" },
          { name: "Denmark", code: "dk" },
          { name: "Djibouti", code: "dj" },
          { name: "Dominica", code: "dm" },
          { name: "Dominican Republic", code: "do" },
          { name: "Ecuador", code: "ec" },
          { name: "Egypt", code: "eg" },
          { name: "El Salvador", code: "sv" },
          { name: "Equatorial Guinea", code: "gq" },
          { name: "Eritrea", code: "er" },
          { name: "Estonia", code: "ee" },
          { name: "Eswatini", code: "sz" },
          { name: "Ethiopia", code: "et" },
          { name: "Falkland Islands", code: "fk" },
          { name: "Faroe Islands", code: "fo" },
          { name: "Fiji", code: "fj" },
          { name: "Finland", code: "fi" },
          { name: "France", code: "fr" },
          { name: "French Guiana", code: "gf" },
          { name: "French Polynesia", code: "pf" },
          { name: "French Southern Territories", code: "tf" },
          { name: "Gabon", code: "ga" },
          { name: "Gambia", code: "gm" },
          { name: "Georgia", code: "ge" },
          { name: "Germany", code: "de" },
          { name: "Ghana", code: "gh" },
          { name: "Gibraltar", code: "gi" },
          { name: "Greece", code: "gr" },
          { name: "Greenland", code: "gl" },
          { name: "Grenada", code: "gd" },
          { name: "Guadeloupe", code: "gp" },
          { name: "Guam", code: "gu" },
          { name: "Guatemala", code: "gt" },
          { name: "Guernsey", code: "gg" },
          { name: "Guinea", code: "gn" },
          { name: "Guinea-Bissau", code: "gw" },
          { name: "Guyana", code: "gy" },
          { name: "Haiti", code: "ht" },
          { name: "Heard Island and McDonald Islands", code: "hm" },
          { name: "Honduras", code: "hn" },
          { name: "Hong Kong", code: "hk" },
          { name: "Hungary", code: "hu" },
          { name: "Iceland", code: "is" },
          { name: "India", code: "in" },
          { name: "Indonesia", code: "id" },
          { name: "Iran", code: "ir" },
          { name: "Iraq", code: "iq" },
          { name: "Ireland", code: "ie" },
          { name: "Isle of Man", code: "im" },
          { name: "Israel", code: "il" },
          { name: "Italy", code: "it" },
          { name: "Jamaica", code: "jm" },
          { name: "Japan", code: "jp" },
          { name: "Jersey", code: "je" },
          { name: "Jordan", code: "jo" },
          { name: "Kazakhstan", code: "kz" },
          { name: "Kenya", code: "ke" },
          { name: "Kiribati", code: "ki" },
          { name: "Kuwait", code: "kw" },
          { name: "Kyrgyzstan", code: "kg" },
          { name: "Laos", code: "la" },
          { name: "Latvia", code: "lv" },
          { name: "Lebanon", code: "lb" },
          { name: "Lesotho", code: "ls" },
          { name: "Liberia", code: "lr" },
          { name: "Libya", code: "ly" },
          { name: "Liechtenstein", code: "li" },
          { name: "Lithuania", code: "lt" },
          { name: "Luxembourg", code: "lu" },
          { name: "Macau", code: "mo" },
          { name: "Madagascar", code: "mg" },
          { name: "Malawi", code: "mw" },
          { name: "Malaysia", code: "my" },
          { name: "Maldives", code: "mv" },
          { name: "Mali", code: "ml" },
          { name: "Malta", code: "mt" },
          { name: "Marshall Islands", code: "mh" },
          { name: "Martinique", code: "mq" },
          { name: "Mauritania", code: "mr" },
          { name: "Mauritius", code: "mu" },
          { name: "Mayotte", code: "yt" },
          { name: "Mexico", code: "mx" },
          { name: "Micronesia", code: "fm" },
          { name: "Moldova", code: "md" },
          { name: "Monaco", code: "mc" },
          { name: "Mongolia", code: "mn" },
          { name: "Montenegro", code: "me" },
          { name: "Montserrat", code: "ms" },
          { name: "Morocco", code: "ma" },
          { name: "Mozambique", code: "mz" },
          { name: "Myanmar", code: "mm" },
          { name: "Namibia", code: "na" },
          { name: "Nauru", code: "nr" },
          { name: "Nepal", code: "np" },
          { name: "Netherlands", code: "nl" },
          { name: "New Caledonia", code: "nc" },
          { name: "New Zealand", code: "nz" },
          { name: "Nicaragua", code: "ni" },
          { name: "Niger", code: "ne" },
          { name: "Nigeria", code: "ng" },
          { name: "Niue", code: "nu" },
          { name: "Norfolk Island", code: "nf" },
          { name: "North Korea", code: "kp" },
          { name: "North Macedonia", code: "mk" },
          { name: "Northern Mariana Islands", code: "mp" },
          { name: "Norway", code: "no" },
          { name: "Oman", code: "om" },
          { name: "Pakistan", code: "pk" },
          { name: "Palau", code: "pw" },
          { name: "Palestine", code: "ps" },
          { name: "Panama", code: "pa" },
          { name: "Papua New Guinea", code: "pg" },
          { name: "Paraguay", code: "py" },
          { name: "Peru", code: "pe" },
          { name: "Philippines", code: "ph" },
          { name: "Pitcairn", code: "pn" },
          { name: "Poland", code: "pl" },
          { name: "Portugal", code: "pt" },
          { name: "Puerto Rico", code: "pr" },
          { name: "Qatar", code: "qa" },
          { name: "Réunion", code: "re" },
          { name: "Romania", code: "ro" },
          { name: "Russia", code: "ru" },
          { name: "Rwanda", code: "rw" },
          { name: "Saint Barthélemy", code: "bl" },
          { name: "Saint Helena", code: "sh" },
          { name: "Saint Kitts and Nevis", code: "kn" },
          { name: "Saint Lucia", code: "lc" },
          { name: "Saint Martin", code: "mf" },
          { name: "Saint Pierre and Miquelon", code: "pm" },
          { name: "Saint Vincent and the Grenadines", code: "vc" },
          { name: "Samoa", code: "ws" },
          { name: "San Marino", code: "sm" },
          { name: "São Tomé and Príncipe", code: "st" },
          { name: "Saudi Arabia", code: "sa" },
          { name: "Senegal", code: "sn" },
          { name: "Serbia", code: "rs" },
          { name: "Seychelles", code: "sc" },
          { name: "Sierra Leone", code: "sl" },
          { name: "Singapore", code: "sg" },
          { name: "Sint Maarten", code: "sx" },
          { name: "Slovakia", code: "sk" },
          { name: "Slovenia", code: "si" },
          { name: "Solomon Islands", code: "sb" },
          { name: "Somalia", code: "so" },
          { name: "South Africa", code: "za" },
          { name: "South Korea", code: "kr" },
          { name: "South Sudan", code: "ss" },
          { name: "Spain", code: "es" },
          { name: "Sri Lanka", code: "lk" },
          { name: "Sudan", code: "sd" },
          { name: "Suriname", code: "sr" },
          { name: "Sweden", code: "se" },
          { name: "Switzerland", code: "ch" },
          { name: "Syria", code: "sy" },
          { name: "Taiwan", code: "tw" },
          { name: "Tajikistan", code: "tj" },
          { name: "Tanzania", code: "tz" },
          { name: "Thailand", code: "th" },
          { name: "Timor-Leste", code: "tl" },
          { name: "Togo", code: "tg" },
          { name: "Tokelau", code: "tk" },
          { name: "Tonga", code: "to" },
          { name: "Trinidad and Tobago", code: "tt" },
          { name: "Tunisia", code: "tn" },
          { name: "Turkey", code: "tr" },
          { name: "Turkmenistan", code: "tm" },
          { name: "Turks and Caicos Islands", code: "tc" },
          { name: "Tuvalu", code: "tv" },
          { name: "Uganda", code: "ug" },
          { name: "Ukraine", code: "ua" },
          { name: "United Arab Emirates", code: "ae" },
          { name: "United Kingdom", code: "gb" },
          { name: "United States", code: "us" },
          { name: "Uruguay", code: "uy" },
          { name: "Uzbekistan", code: "uz" },
          { name: "Vanuatu", code: "vu" },
          { name: "Vatican City", code: "va" },
          { name: "Venezuela", code: "ve" },
          { name: "Vietnam", code: "vn" },
          { name: "Virgin Islands (British)", code: "vg" },
          { name: "Virgin Islands (US)", code: "vi" },
          { name: "Wallis and Futuna", code: "wf" },
          { name: "Western Sahara", code: "eh" },
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
            this.flagItems.classList.toggle("select-hide");
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
            if (this.logoItems) this.logoItems.classList.toggle("select-hide");
          });
        }

        if (this.logoItems) {
          this.logoItems.addEventListener("click", (e) => {
            const item = e.target.closest(".item");
            if (!item) return;

            const val = item.getAttribute("data-value");
            const url = item.getAttribute("data-logo-url");
            const labelUrl = item.getAttribute("data-label-url");
            const labelText = item.getAttribute("data-label-text");

            if (this.logoInput) this.logoInput.value = val;
            if (this.logoSelect) {
              const selectedDisplay =
                this.logoSelect.querySelector("[data-selected-name]");
              if (selectedDisplay) selectedDisplay.innerText = val;
            }
            if (this.logoItems) this.logoItems.classList.add("select-hide");

            this.updateLogoPreview(url, labelUrl, labelText);
            this.updateVariantOption();

            if (window.innerWidth < 1024) this.scrollToPreview();
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
          if (window.innerWidth < 1024) {
            this.scrollToPreview();
          }
        }, 1000);

        if (this.nameInput)
          this.nameInput.addEventListener("input", () => {
            this.updatePreview();
            this.debouncedScroll();
          });
        if (this.numberInput)
          this.numberInput.addEventListener("input", () => {
            this.updatePreview();
            this.debouncedScroll();
          });

        if (this.clearBtn)
          this.clearBtn.addEventListener(
            "click",
            this.clearCustomization.bind(this),
          );

        if (this.dropdownClearBtn)
          this.dropdownClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.selectFlag({ name: "", code: "" });
          });

        if (this.logoClearBtn) {
          this.logoClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.logoInput) this.logoInput.value = "";
            if (this.logoSelect) {
              const selectedDisplay =
                this.logoSelect.querySelector("[data-selected-name]");
              if (selectedDisplay) selectedDisplay.innerText = "Select Logo";
            }
            if (this.logoItems) this.logoItems.classList.add("select-hide");
            this.updateLogoPreview("", "", "");
            this.updateVariantOption();
          });
        }

        window.addEventListener("click", () => {
          if (this.flagItems) this.flagItems.classList.add("select-hide");
          if (this.logoItems) this.logoItems.classList.add("select-hide");
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
            this.updateFlagPreview("");
          }
          this.updatePreview();
          this.updateVariantOption();
        }, 100);
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
        if (this.selectedName) {
          if (country.code) {
            this.selectedName.innerHTML = `<img src="https://flagcdn.com/w40/${country.code}.png" class="item-flag" alt="${country.name}"> ${country.name}`;
          } else {
            this.selectedName.innerText = "Select Nationality";
          }
        }
        if (this.flagItems) this.flagItems.classList.add("select-hide");
        this.updateFlagPreview(country.code);
        this.updateVariantOption();

        // Smooth scroll to preview on mobile/tablet
        if (window.innerWidth < 1024) {
          this.scrollToPreview();
        }
      }

      scrollToPreview() {
        const selectors = [
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
          const yOffset = -20; // Offset to see a bit of the top
          const y =
            preview.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }

      updateFlagPreview(code) {
        const frontFlag = document.getElementById("PreviewFlagFront");
        const backFlag = document.getElementById("PreviewFlagBack");
        const frontContainer = document.getElementById(
          "PreviewFlagFrontContainer",
        );
        const backContainer = document.getElementById(
          "PreviewFlagBackContainer",
        );

        if (frontFlag && code) {
          frontFlag.src = `https://flagcdn.com/w80/${code}.png`;
          if (frontContainer) frontContainer.style.display = "block";
        } else if (frontFlag) {
          if (frontContainer) frontContainer.style.display = "none";
        }

        if (backFlag && code) {
          backFlag.src = `https://flagcdn.com/w80/${code}.png`;
          if (backContainer) backContainer.style.display = "block";
        } else if (backFlag) {
          if (backContainer) backContainer.style.display = "none";
        }
      }

      updateLogoPreview(logoUrl, labelUrl, labelText) {
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

        // Update Label Image
        if (frontLogoLabel && labelUrl) {
          frontLogoLabel.src = labelUrl;
          if (frontLogoLabelContainer)
            frontLogoLabelContainer.style.display = "block";
        } else if (frontLogoLabel) {
          if (frontLogoLabelContainer)
            frontLogoLabelContainer.style.display = "none";
        }
      }

      toggleDrawer() {
        if (!this.drawer) return;
        const isHidden = this.drawer.style.display === "none";
        this.drawer.style.display = isHidden ? "block" : "none";

        if (this.toggleBtn) {
          this.toggleBtn.innerText = isHidden ? "Done" : "Customize";
        }

        const variantPicker =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (variantPicker) variantPicker.style.display = isHidden ? "none" : "";
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
          this.updateFlagPreview("");
        }
        if (this.logoInput) {
          this.logoInput.value = "";
          if (this.logoSelect) {
            const selectedDisplay =
              this.logoSelect.querySelector("[data-selected-name]");
            if (selectedDisplay) selectedDisplay.innerText = "Select Logo";
          }
          this.updateLogoPreview("", "", "");
        }
        this.updatePreview();
        this.updateVariantOption();
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
        this.updateVariantOption();
      }

      updateVariantOption() {
        const hasCustomization =
          (this.nameInput && this.nameInput.value.trim() !== "") ||
          (this.numberInput && this.numberInput.value.trim() !== "") ||
          (this.flagInput && this.flagInput.value.trim() !== "") ||
          (this.logoInput && this.logoInput.value.trim() !== "");

        const newValue = hasCustomization ? "YES" : "NO";

        const container =
          document.querySelector("variant-selects") ||
          document.querySelector("variant-radios");
        if (!container) return;

        const optionNames = ["Flag", "NameAndNumber"];

        optionNames.forEach((optionName) => {
          let optionSelect = container.querySelector(
            `select[name="options[${optionName}]"]`,
          );
          let optionRadios = container.querySelectorAll(
            `input[name^="${optionName}"]`,
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
                  optionRadios = parent.querySelectorAll('input[type="radio"]');
                  break;
                }
              }
            }
          }

          if (optionSelect) {
            if (optionSelect.value !== newValue) {
              optionSelect.value = newValue;
              optionSelect.dispatchEvent(
                new Event("change", { bubbles: true }),
              );
            }
          } else if (optionRadios.length > 0) {
            optionRadios.forEach((radio) => {
              if (radio.value === newValue && !radio.checked) {
                radio.checked = true;
                radio.dispatchEvent(new Event("change", { bubbles: true }));
              }
            });
          }
        });

        this.updatePriceBreakdown(hasCustomization);
      }

      setupPriceObserver() {
        // Find the price container. Dawn usually updates the content of [role="status"] or the .price div inside it.
        const priceContainer = document.querySelector('[id^="price-"]');
        if (!priceContainer) return;

        this.observer = new MutationObserver((mutations) => {
          // When Dawn updates the price, our label might be destroyed or hidden.
          // We re-apply our logic.
          const hasCustomization =
            (this.nameInput && this.nameInput.value.trim() !== "") ||
            (this.numberInput && this.numberInput.value.trim() !== "") ||
            (this.flagInput && this.flagInput.value.trim() !== "");

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
                (optName === "Flag" || optName === "NameAndNumber")
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

          this.priceLabel.innerHTML = `${format(basePrice)} + ${format(diff)} (Customization)`;
          this.priceLabel.style.display = "block";
        }
      }

      debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            fn.apply(this, args);
          }, delay);
        };
      }
    },
  );
}
