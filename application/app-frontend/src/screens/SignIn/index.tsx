import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AuthCard, authStyles } from '../../components/AuthCard';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../services/api';
import { copy } from '../../copy/strings';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SignInScreen() {
  const nav = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signIn(identifier, password);
      nav.navigate('Home');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen active="SignIn">
      <AuthCard
        docLabel={copy.signIn.docLabel}
        title={<>{copy.signIn.title}</>}
        subtitle={copy.signIn.subtitle}
      >
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        <Field label={copy.signIn.identifier} placeholder={copy.signIn.identifierPlaceholder} value={identifier} onChangeText={setIdentifier} autoCapitalize="none" autoComplete="email" onSubmitEditing={submit} />
        <Field label={copy.signIn.password} placeholder={copy.signIn.passwordPlaceholder} value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={submit} />
        <Button label={busy ? copy.signIn.submitting : copy.signIn.submit} full disabled={busy} onPress={submit} />
        <View style={authStyles.switchRow}>
          <Text style={authStyles.switchText}>{copy.signIn.switchText}</Text>
          <Hoverable onPress={() => nav.navigate('SignUp')}>
            <Text style={authStyles.switchLink}>{copy.signIn.switchLink}</Text>
          </Hoverable>
        </View>
      </AuthCard>
    </Screen>
  );
}
