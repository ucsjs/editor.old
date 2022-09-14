export default {
    methods:{
        getColorByType(type){
            switch(type){
                case "Int": return "#0369A0";
                case "Float": return "#953A1B";
                case "String": return "#166534";
                case "Any": return "#C98904";
                case "JSON": return "#9603c6";
                default: return "white";
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
            const iconExt = {    
                "json": { icon: "fa-solid fa-code", color: "text-green-500" },
                "ts": { icon: "fa-solid fa-code", color: "text-green-500" },
                "js": { icon: "fa-brands fa-js", color: "text-green-500" },
                "vue": { icon: "fa-brands fa-vuejs", color: "text-green-500" },
                "blueprint": { icon: "fa-solid fa-object-group", color: "text-green-500" }
            }

            return (iconExt[ext.replace(".", "")]) ? iconExt[ext.replace(".", "")].icon : "fa-solid fa-code";
        },

        uppercaseFirstLetter(value) {
            return (value && value.length > 0) ? value.charAt(0).toUpperCase() + value.slice(1) : value
        }
    }
}