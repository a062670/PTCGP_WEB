<template>
  <q-page>
    <div class="q-pa-md" v-if="pageStore.isLoaded">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h6">奴隸市場</div>
        <q-icon name="info" class="text-info" size="sm">
          <q-tooltip> 您可以在此申請奴隸，並隨意使用他們。 </q-tooltip>
        </q-icon>
        <div class="col"></div>
        <div class="col-auto row items-center q-gutter-sm">
          <q-select
            dense
            outlined
            v-model="pageStore.language"
            :options="languageOptions"
            label="語言"
            emit-value
            map-options
            style="width: 130px"
          />
          <q-select
            dense
            outlined
            v-model="pageStore.packId"
            :options="packOptions"
            label="包"
            emit-value
            map-options
            style="width: 130px"
          />
          <q-btn color="primary" label="申請奴隸" @click="pageStore.applyAccountForChange" />
        </div>
      </div>
      <div class="row justify-center q-mt-md" v-if="!pageStore.accountList.length">
        <div class="text-h6">沒有任何結果</div>
      </div>
      <div class="q-mt-md" v-if="pageStore.accountList.length">
        <q-markup-table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>語言</th>
              <th>包</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="account in pageStore.accountList" :key="account.id">
              <td>{{ account.nick }}</td>
              <td>{{ languageInfo[account.language] }}</td>
              <td>{{ packName[account.pack_id] }}</td>
              <td class="q-gutter-sm">
                <q-btn color="primary" label="奴隸契約書" @click="pageStore.downloadXml(account)" />
                <q-btn
                  color="negative"
                  label="抹殺"
                  @click="pageStore.deleteAccountForChange(account.id)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserDataStore } from 'src/stores/user-data';
import { useHlAccountForChangeStore } from 'stores/hl-account-for-change';
import packName from 'src/data/packName';
import languageInfo from 'src/data/languageInfo';

const userDataStore = useUserDataStore();
const pageStore = useHlAccountForChangeStore();
const router = useRouter();

if (!userDataStore.isLogin || !userDataStore.data.permissions.hl) {
  void router.push({
    name: 'index',
  });
}

const packOptions = ref([]);
for (const packId in packName) {
  packOptions.value.push({
    label: packName[packId],
    value: packId,
  });
}

const languageOptions = ref([]);
for (const language in languageInfo) {
  languageOptions.value.push({
    label: languageInfo[language],
    value: language,
  });
}

onMounted(async () => {
  await pageStore.getAccountList();
});
</script>

<style lang="scss" scoped></style>
