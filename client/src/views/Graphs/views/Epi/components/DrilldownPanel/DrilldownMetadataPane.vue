<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata" >
      <collapsible-item>
        <div slot="title">Type</div>
        <div slot="content">
          <div class="metadata-item">
              {{getType}}
          </div>
        </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Provenance</div>
        <div slot="content">
          <div class="metadata-item">
          <div v-for="(value, key) in getProvenance" :key="key">
            <div class="key">{{key | capitalize-first-letter-formatter}}</div>
            <div v-if="key !== 'sources'">{{value}}</div>
            <div v-else>
              <div v-for="(source, key) in value[0]" :key="key">
                  {{source}}
                </div>
            </div>
          </div>
        </div>
        </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Attributes</div>
        <div slot="content">
        <div class="metadata-item">
          <div v-for="(item, index) in getAttributes" :key="index">
            <div v-for="(value, key) in item" :key="key">
            <div class="key">{{key | capitalize-first-letter-formatter}}</div>
              {{value}}
            </div>
          </div>
        </div>      </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Knowledge</div>
        <div slot="content" class="knowledge-container">
          <div v-for="(item, index) in formattedData" :key="index" class="snippet-container">
            <div class="snippet-title">
              <a target="_blank" :href="item.URL">{{item.title}}</a>
            </div>
            <span v-for="(snippet, index) in item.highlight" :key="index" v-html="snippet" class="snippet-highlights"/>
          </div>  
          <div class="my-3">
            <button type="button" class="btn btn-primary mr-1" @click="showMoreHandler">Show more...</button>
          </div>
        </div>
      </collapsible-item>
    </div>     

    <div v-else class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';

  import { CosmosSearchInterface, CosmosSearchObjectsInterface, CosmosTextSnippet } from '@/types/typesCosmos';
  import { cosmosSearch, filterToParamObj } from '@/utils/CosmosFetchUtil';

  const components = {
    CollapsibleItem,
  };

  const bakedData =  {
    	"success": {
    		"v": 1,
    		"next_page": "",
    		"scrollId": "",
    		"hits": 1,
    		"data": [{
    			"pubname": "Chaos, Solitons & Fractals",
    			"publisher": "Elsevier",
    			"_gddid": "5ef5fd21a58f1dfd520aec60",
    			"title": "FORECASTING COVID-19 PANDEMIC: A DATA-DRIVEN ANALYSIS",
    			"doi": "10.1016/j.chaos.2020.110046",
    			"coverDate": "Available online 25 June 2020",
    			"URL": "https://www.sciencedirect.com/science/article/pii/S0960077920304434?v=s5",
    			"authors": "",
    			"highlight": ["carriers, our analysis estimates the value of the <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "estimates the value of the <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> (R0 ) as", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> (R0 ) as of May 11, 2020 was found to be", "0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class=\"hl\">Basic</em> <em class=\"hl\">Reproduction</em> <em class=\"hl\">Number</em>", "0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class=\"hl\">Basic</em> <em class=\"hl\">Reproduction</em> <em class=\"hl\">Number</em> for Proposed", "<em class=\"hl\">Basic</em> <em class=\"hl\">Reproduction</em> <em class=\"hl\">Number</em> for Proposed Model Using the next generation", "= −σ1 k γ + φD −σ2 k 0 φU + δU   The associated <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>,", "+ δU   The associated <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>, denoted", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>, denoted by R0 is then given by, R0 = ρ (FV", "represents the robustness of the model forecasting. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "model forecasting. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is 4.234", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is 4.234 as of May 08, which lies in prior", "peak around June 11 with about 26.449K cases. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "about 26.449K cases. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is estimated", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is estimated about 5.3467 as of May 11, which", "about 5.3467 as of May 11, which is in between the observed <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> for", "in between the observed <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> for COVID-19,", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> for COVID-19, estimated about 2-7 for COVID-19", "peak around June 15 with about 9.504K cases. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "about 9.504K cases. The <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is 5.218", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is 5.218 as of May 11, which lies between", "of COVID-19 dynamics. According to our calculation, the <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "to our calculation, the <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is around", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> is around 4.649 as of May 09, which lies", "control the disease burden of COVID-19. Otherwise, this <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em>", "COVID-19. Otherwise, this <em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> could increase", "<em class=\"hl\">basic</em> <em class=\"hl\">reproduction</em> <em class=\"hl\">number</em> could increase upto 5.7 within 20 days and"]
    		}]
    	}
    };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    dataLoading = false;
    knowledgeResults: CosmosSearchInterface | Record<any, never> = {};
    knowledgeResultsDisplayed: CosmosSearchObjectsInterface[];
    knowledgeResultsCounter: number;


    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.metadata);
    }

    get getType (): string {
      return !_.isEmpty(this.metadata) && this.metadata.type;
    }

    get getProvenance (): any {
      return !_.isEmpty(this.metadata) && this.metadata.provenance;
    }

    get getAttributes (): any {
      return !_.isEmpty(this.metadata) && this.metadata.attributes;
    }

    get getTextDefinition (): string {
      return (!_.isEmpty(this.metadata) && !_.isEmpty(this.metadata.attributes[0].text_definition)) && this.metadata.attributes[0].text_definition;
    }

    get knowledgeSectionHeader (): string {
      return !_.isEmpty(this.knowledgeResults) &&  `Artifacts  ${this.knowledgeResultsDisplayed.length}/${this.knowledgeResultsCounter}`;
    }

    get formattedData (): any {
      return  bakedData.success.data.map(d=> _.pick(d, ['title', 'URL', 'highlight']));
    }

    // mounted (): void {
    //   this.fetchCosmos();
    // }

    // async fetchCosmos (): Promise<void> {
    //   if (this.getTextDefinition) {
    //     try {
    //       this.dataLoading = true;
    //       const filter = { cosmosQuery: this.getTextDefinition};
    //       const response = await cosmosSearch(filterToParamObj(filter));
    //       this.knowledgeResults = response;
    //       this.knowledgeResultsCounter = this.knowledgeResults.total;
    //       this.knowledgeResultsDisplayed = response.objects.slice(0,5); //Just get the first 5 objects
    //       console.log(this.knowledgeResultsDisplayed);
    //     } catch (e) {
    //       throw Error(e);
    //     }
    //     this.dataLoading = false;
    //   }
    // }
    showMoreHandler (e: Event): void {
      this.$emit('open-modal');
      e.preventDefault();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-metadata-pane-container {
  .metadata-header {
    padding: 5px;
    color: $text-color-dark;
    background-color: $drilldown-header;
  }
  .metadata-item {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    text-align: left;
    margin-top: 5px;
    padding: 5px;
    .key {
      font-weight: bold;
      padding-top: 5px;
    }
  }


  .knowledge-container {
    display: flex;
    flex-direction: column;
    height: 50vh;
    overflow:hidden;
    .snippet-container {
      flex: 1;
      overflow: auto;
      border: 1px solid $border;
      padding: 4px 8px;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      .snippet-highlights {
        font-size: 14px;
        em {
          font-weight: bold;
        }
      }

    }
  }


  .artifact-img {
    width: 45%;
    height: 0;
    padding-top: 45%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #EAEBEC;
    float: left;
    border: $icon-color solid 1px;
    border-radius: 10px;
    margin: 2.5%;
  }
}
</style>
