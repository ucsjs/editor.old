export default {
    methods:{
        getColorByType(type){
            switch(type){
                case "Int": return "#0369A0";
                case "Float": return "#953A1B";
                case "String": return "#166534";
                case "Any": return "#C98904";
                case "JSON": return "#9603c6";
                case "Boolean": return "#1941d3";
                default: return "white";
                true
            }
        },

        headerColor(type){
            switch(type){
                case "Debug": return "#7F1D1D";
                case "Common": return "#312F81";
                case "Math": return "#1F2937";
                case "Encoding": return "#78350F";
                case "Converters": return "#831843";
                case "Network": return "#F29D0D";
                default: return "linear-gradient(to right top, rgb(55, 65, 81), rgb(17, 24, 39), rgb(0, 0, 0))";
            }
        },

        headerIcon(type){
            switch(type){
                case "Debug": return "fa-solid fa-bug";
                case "Common": return "fa-brands fa-codepen";
                case "Math": return "fa-solid fa-square-root-variable";
                case "Encoding": return "fa-solid fa-superscript";
                case "Converters": return "fa-solid fa-shuffle";
                default: return "fa-brands fa-codepen";
            }
        },

        iconFromExt(ext){
            let icon = { icon: "fa-regular fa-file" };

            const iconExt = {    
                "blueprint.ts": { icon: "fa-solid fa-boxes-stacked", color: "#F29D0D" },
                "page.ts": { icon: "fa-solid fa-table-columns", color: "#4B1E96" },
                ".json": { icon: "fa-solid fa-code", color: "#A0A0A0" },
                ".ts": { icon: "fa-solid fa-code", color: "#2D79C7" },
                ".js": { icon: "fa-brands fa-square-js", color: "#F0DB4F" },
                ".vue": { icon: "fa-brands fa-vuejs", color: "#3FB984" },
                ".npmignore": { icon: "fa-brands fa-npm", color: "#FF0000" },
                ".gitignore": { icon: "fa-brands fa-git-alt", color: "#3d3d3d" },
                ".log": { icon: "fa-solid fa-align-left", color: "#cccccc" },
                ".md": { icon: "fa-solid fa-circle-info", color: "#6095d6" },
                ".html": { icon: "fa-regular fa-file-code", color: "#b27211" }
            }

            if(ext){
                for(let key in iconExt){
                    if(ext.includes(key)){
                        icon = iconExt[key];
                        break;
                    }                
                }
            }

            return icon;
        },

        uppercaseFirstLetter(value) {
            return (value && value.length > 0) ? value.charAt(0).toUpperCase() + value.slice(1) : value
        },

        fixedLabel(value) {
            return (value) ? this.uppercaseFirstLetter(value === null || value === void 0 ? void 0 : value.replace(/([A-Z])/g, " $1")) : '';
        }
    }
}